import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlogSourceService } from '../blog-source/blog-source.service';
import { BlogSource } from '../blog-source/blog-source.entity';
import { BlogPostService, CollectedFeedItem } from '../blog-post/blog-post.service';

@Injectable()
export class FeedCollectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedCollectorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly intervalMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly blogSourceService: BlogSourceService,
    private readonly blogPostService: BlogPostService,
  ) {
    this.intervalMs = this.configService.get<number>(
      'COLLECTOR_INTERVAL_MS',
      5 * 60 * 1000,
    );
  }

  onModuleInit() {
    if (this.intervalMs <= 0) {
      this.logger.warn(
        `Collector disabled because interval is invalid: ${this.intervalMs}`,
      );
      return;
    }

    this.timer = setInterval(() => {
      void this.runCollectionCycle();
    }, this.intervalMs);

    this.logger.log(
      `Feed collector started (interval: ${this.intervalMs}ms, ${Math.floor(
        this.intervalMs / 1000,
      )}s)`,
    );

    void this.runCollectionCycle();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runCollectionCycle() {
    if (this.isRunning) {
      this.logger.warn('Collection cycle is already running. Skipping.');
      return;
    }

    this.isRunning = true;
    try {
      const sources = await this.blogSourceService.getActiveBlogSources();

      if (sources.length === 0) {
        this.logger.debug('No active blog sources to collect.');
        return;
      }

      this.logger.log(`Collection cycle started for ${sources.length} sources.`);
      for (const source of sources) {
        await this.collectSource(source);
      }
      this.logger.log('Collection cycle finished.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Collection cycle failed: ${message}`);
    } finally {
      this.isRunning = false;
    }
  }

  private async collectSource(source: BlogSource) {
    try {
      const discoveredFeedUrl = await this.discoverFeedUrl(source.url);

      if (discoveredFeedUrl) {
        this.logger.log(
          `Feed found for source ${source.id}: ${discoveredFeedUrl}`,
        );

        const feedXml = await this.fetchFeedXml(discoveredFeedUrl);
        if (feedXml) {
          const items = this.parseFeedItems(feedXml);
          if (items.length > 0) {
            await this.blogPostService.upsertManyFromFeed(source, items);
            this.logger.log(
              `Saved ${items.length} posts for source ${source.id}`,
            );
          } else {
            this.logger.warn(
              `No parsable posts found in feed: ${discoveredFeedUrl}`,
            );
          }
        }
      } else {
        this.logger.warn(`No feed found for source ${source.id}: ${source.url}`);
      }

      await this.blogSourceService.updateCollectionMetadata(
        source.id,
        new Date(),
        discoveredFeedUrl,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to collect source ${source.id} (${source.url}): ${message}`,
      );
    }
  }

  private async discoverFeedUrl(sourceUrl: string): Promise<string | null> {
    const candidates = this.buildFeedCandidates(sourceUrl);

    for (const candidate of candidates) {
      const feedUrl = await this.resolveFeedUrl(candidate, new Set<string>());
      if (feedUrl) {
        return feedUrl;
      }
    }

    return null;
  }

  private buildFeedCandidates(sourceUrl: string): string[] {
    const candidates = new Set<string>();
    candidates.add(sourceUrl);

    const commonPaths = ['/feed', '/rss', '/atom.xml', '/rss.xml', '/feed.xml'];
    for (const path of commonPaths) {
      candidates.add(new URL(path, sourceUrl).toString());
    }

    return [...candidates];
  }

  private async resolveFeedUrl(
    url: string,
    visited: Set<string>,
  ): Promise<string | null> {
    if (visited.has(url)) {
      return null;
    }
    visited.add(url);

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (
        contentType.includes('application/rss+xml') ||
        contentType.includes('application/atom+xml') ||
        contentType.includes('application/xml') ||
        contentType.includes('text/xml')
      ) {
        return url;
      }

      if (!contentType.includes('text/html')) {
        const body = (await response.text()).slice(0, 5000).toLowerCase();
        const looksLikeFeed =
          body.includes('<rss') ||
          body.includes('<feed') ||
          body.includes('<rdf:rdf');
        return looksLikeFeed ? url : null;
      }

      const html = await response.text();
      const feedLinks = this.extractFeedLinksFromHtml(html, url);

      for (const link of feedLinks) {
        const resolved = await this.resolveFeedUrl(link, visited);
        if (resolved) {
          return resolved;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private extractFeedLinksFromHtml(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkTagRegex = /<link\s+[^>]*>/gi;
    const tags = html.match(linkTagRegex) ?? [];

    for (const tag of tags) {
      const relMatch = tag.match(/rel=["']([^"']+)["']/i);
      const typeMatch = tag.match(/type=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);

      if (!hrefMatch) {
        continue;
      }

      const relValue = relMatch?.[1]?.toLowerCase() ?? '';
      const typeValue = typeMatch?.[1]?.toLowerCase() ?? '';

      const isAlternate = relValue.includes('alternate');
      const isFeedType =
        typeValue.includes('application/rss+xml') ||
        typeValue.includes('application/atom+xml') ||
        typeValue.includes('application/xml') ||
        typeValue.includes('text/xml');

      if (!isAlternate || !isFeedType) {
        continue;
      }

      try {
        links.push(new URL(hrefMatch[1], baseUrl).toString());
      } catch {
        continue;
      }
    }

    return links;
  }

  private async fetchFeedXml(feedUrl: string): Promise<string | null> {
    try {
      const response = await fetch(feedUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      const lower = content.toLowerCase();
      if (
        lower.includes('<rss') ||
        lower.includes('<feed') ||
        lower.includes('<rdf:rdf')
      ) {
        return content;
      }

      return null;
    } catch {
      return null;
    }
  }

  private parseFeedItems(feedXml: string): CollectedFeedItem[] {
    const xml = feedXml.trim();
    if (xml.includes('<item')) {
      return this.parseRssItems(xml);
    }
    if (xml.includes('<entry')) {
      return this.parseAtomEntries(xml);
    }
    return [];
  }

  private parseRssItems(feedXml: string): CollectedFeedItem[] {
    const blocks = feedXml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
    const items: CollectedFeedItem[] = [];

    for (const block of blocks) {
      const title = this.readTag(block, 'title');
      const link = this.readTag(block, 'link');
      const guid = this.readTag(block, 'guid');
      const summary =
        this.readTag(block, 'description') ??
        this.readTag(block, 'content:encoded');
      const publishedRaw =
        this.readTag(block, 'pubDate') ?? this.readTag(block, 'dc:date');

      const resolvedUrl = link ?? guid;
      if (!title || !resolvedUrl) {
        continue;
      }

      items.push({
        externalId: guid ?? resolvedUrl,
        url: resolvedUrl,
        title: this.cleanText(title),
        summary: summary ? this.cleanText(summary) : null,
        publishedAt: this.parseDate(publishedRaw),
      });
    }

    return items;
  }

  private parseAtomEntries(feedXml: string): CollectedFeedItem[] {
    const blocks = feedXml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
    const items: CollectedFeedItem[] = [];

    for (const block of blocks) {
      const title = this.readTag(block, 'title');
      const id = this.readTag(block, 'id');
      const url = this.readAtomLink(block);
      const summary = this.readTag(block, 'summary') ?? this.readTag(block, 'content');
      const publishedRaw =
        this.readTag(block, 'published') ?? this.readTag(block, 'updated');

      const resolvedUrl = url ?? id;
      if (!title || !resolvedUrl) {
        continue;
      }

      items.push({
        externalId: id ?? resolvedUrl,
        url: resolvedUrl,
        title: this.cleanText(title),
        summary: summary ? this.cleanText(summary) : null,
        publishedAt: this.parseDate(publishedRaw),
      });
    }

    return items;
  }

  private readTag(xml: string, tagName: string): string | null {
    const escaped = tagName.replace(':', '\\:');
    const regex = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i');
    const match = xml.match(regex);
    if (!match) {
      return null;
    }
    return this.cleanText(match[1]);
  }

  private readAtomLink(entryXml: string): string | null {
    const linkTags = entryXml.match(/<link\b[^>]*>/gi) ?? [];
    for (const tag of linkTags) {
      const relMatch = tag.match(/rel=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) {
        continue;
      }
      const rel = relMatch?.[1]?.toLowerCase() ?? 'alternate';
      if (rel === 'alternate' || rel === 'self') {
        return hrefMatch[1];
      }
    }
    return null;
  }

  private cleanText(value: string): string {
    return value
      .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }
}

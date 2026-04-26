import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1777195908070 implements MigrationInterface {
    name = 'InitSchema1777195908070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`post\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER', \`refresh_token\` varchar(255) NULL, \`discord_user_id\` varchar(64) NULL, \`discord_username\` varchar(120) NULL, \`discord_connected_at\` datetime NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_830504b923001d02b76411135d\` (\`discord_user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_post\` (\`id\` int NOT NULL AUTO_INCREMENT, \`external_id\` varchar(500) NOT NULL, \`url\` varchar(1000) NOT NULL, \`title\` varchar(500) NOT NULL, \`summary\` text NULL, \`published_at\` datetime NULL, \`collected_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`source_id\` int NULL, UNIQUE INDEX \`IDX_c7107de11fb5d47c0ad08c6a79\` (\`source_id\`, \`external_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_source\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NULL, \`url\` varchar(500) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`icon_url\` varchar(1000) NULL, \`rss_url\` varchar(500) NULL, \`last_collected_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1cf9b286f9f62f40536329332b\` (\`url\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_subscription\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, \`source_id\` int NULL, UNIQUE INDEX \`IDX_76681576c59503020842e7d1d0\` (\`user_id\`, \`source_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_52378a74ae3724bcab44036645b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_post\` ADD CONSTRAINT \`FK_ba7317cce4de4c695f6e10010ea\` FOREIGN KEY (\`source_id\`) REFERENCES \`blog_source\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_subscription\` ADD CONSTRAINT \`FK_3de604af03b1b572aeb8096255d\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blog_subscription\` ADD CONSTRAINT \`FK_8a25397106a60848eb52f2a77a7\` FOREIGN KEY (\`source_id\`) REFERENCES \`blog_source\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_subscription\` DROP FOREIGN KEY \`FK_8a25397106a60848eb52f2a77a7\``);
        await queryRunner.query(`ALTER TABLE \`blog_subscription\` DROP FOREIGN KEY \`FK_3de604af03b1b572aeb8096255d\``);
        await queryRunner.query(`ALTER TABLE \`blog_post\` DROP FOREIGN KEY \`FK_ba7317cce4de4c695f6e10010ea\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_52378a74ae3724bcab44036645b\``);
        await queryRunner.query(`DROP INDEX \`IDX_76681576c59503020842e7d1d0\` ON \`blog_subscription\``);
        await queryRunner.query(`DROP TABLE \`blog_subscription\``);
        await queryRunner.query(`DROP INDEX \`IDX_1cf9b286f9f62f40536329332b\` ON \`blog_source\``);
        await queryRunner.query(`DROP TABLE \`blog_source\``);
        await queryRunner.query(`DROP INDEX \`IDX_c7107de11fb5d47c0ad08c6a79\` ON \`blog_post\``);
        await queryRunner.query(`DROP TABLE \`blog_post\``);
        await queryRunner.query(`DROP INDEX \`IDX_830504b923001d02b76411135d\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`post\``);
    }

}

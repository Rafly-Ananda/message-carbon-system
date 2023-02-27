import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Table, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsIn, isIn, isInt, IsNotEmpty, IsNumber, IsOptional, IsString, IS_NUMBER, Length, maxLength, MaxLength } from 'class-validator';

@Entity(`business_landing_page_analytics`)
@Index(`idx_business_landing_page_analytics_0`, ['ip_address'])
@Index(`idx_business_landing_page_analytics_1`, ['url'])
@Index(`idx_business_landing_page_analytics_2`, ['business_jabberid'])
@Index(`idx_business_landing_page_analytics_3`, ['business_unique_id'])
export class BusinessChatAnalyticsLandingPage {
    @PrimaryGeneratedColumn()
    id?: number;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    session: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    ip_address: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    url: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    business_jabberid: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    business_unique_id: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    OS: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    browser_agent: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    created_at: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    user_agent: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    device: string;

    @IsNotEmpty()
    @Column({type: 'varchar', length: 255, nullable: false })
    device_name: string;
}
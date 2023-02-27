import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Table, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsIn, isIn, isInt, IsNotEmpty, IsNumber, IsOptional, IsString, IS_NUMBER, Length, maxLength, MaxLength } from 'class-validator';

@Entity(`new_customer`)
@Index("idx_new_customer_0", ['from_id', 'to_id'],  {unique: true})
@Index("idx_new_customer_1", ['business_analytics_id'])
export class BusinessChatAnalyticsNewCustomer {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false })
  business_analytics_id: number;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  from_id: string;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  to_id: string;

  @IsNotEmpty()
  @Column({type: 'datetime', nullable: false })
  send_time: Date;
}
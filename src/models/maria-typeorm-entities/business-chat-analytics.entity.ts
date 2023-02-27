import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Table, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsIn, isIn, isInt, IsNotEmpty, IsNumber, IsOptional, IsString, IS_NUMBER, Length, maxLength, MaxLength } from 'class-validator';



@Entity(`business_chat_analytics`)
@Index("idx_business_chat_analytics_0", ['key_id'],  {unique: true})
@Index("idx_business_chat_analytics_1", ['to_id', 'date_hours', 'room_id'],  {unique: true})
export class BusinessChatAnalytics {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  key_id: string;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  from_id: string;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  to_id: string;

  @IsNotEmpty()
  @Column({type: 'varchar', length: 255, nullable: false })
  room_id: string;

  @IsNotEmpty()
  @Column({type: 'datetime', nullable: false })
  send_time: Date;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false })
  // moment.unix(b).utc().format(), to convert fron unix epoch to normal utc date.
  date_hours: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  @Column()
  year: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  @Column()
  month: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  @Column()
  week_of_year: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  week_of_month: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  day_of_week: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  @Column()
  // date in month 
  date: number;

  @IsNotEmpty()
  @Column({type: 'integer', nullable: false})
  @Column()
  hour: number;
}
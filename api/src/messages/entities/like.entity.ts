import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  messageId: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Message, (message) => message.likes)
  message: Message;

  @CreateDateColumn()
  createdAt: Date;
} 
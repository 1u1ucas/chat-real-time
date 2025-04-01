import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { Like } from './entities/like.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private usersService: UsersService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    console.log('createMessageDto : ', createMessageDto);
    const user = await this.usersService.findOne(userId);
    const message = this.messagesRepository.create({
      ...createMessageDto,
      user,
    });
    return this.messagesRepository.save(message);
  }

  findAll(): Promise<Message[]> {
    return this.messagesRepository.find({
      relations: ['user', 'likes'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: CreateMessageDto,
  ): Promise<Message> {
    await this.messagesRepository.update(id, updateMessageDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.messagesRepository.softDelete(id);
  }

  async toggleLike(messageId: string, userId: string): Promise<Message> {
    const message = await this.findOne(messageId);
    const user = await this.usersService.findOne(userId);

    // Vérifier si l'utilisateur a déjà liké le message
    const existingLike = await this.likesRepository.findOne({
      where: {
        messageId,
        userId,
      },
    });

    if (existingLike) {
      // Si le like existe, on le supprime
      await this.likesRepository.remove(existingLike);
    } else {
      // Si le like n'existe pas, on l'ajoute
      const newLike = this.likesRepository.create({
        messageId,
        userId,
        message,
        user,
      });
      await this.likesRepository.save(newLike);
    }

    // Retourner le message mis à jour avec ses likes
    const updatedMessage = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['user', 'likes'],
    });

    if (!updatedMessage) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    return updatedMessage;
  }
}

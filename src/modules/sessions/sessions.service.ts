import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Session, SessionDocument } from './schema/session';

@Injectable()
export class SessionsService {
  public static WRONG_CREDENTIALS = new UnauthorizedException(
    'WRONG_CREDENTIALS',
    'Email or Password are invalid.',
  );
  public static INVALID_SESSION = new UnauthorizedException(
    'INVALID_SESSION',
    'This session is invalid or has expired',
  );

  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public getByID(id: string): Promise<Session | undefined> {
    if (!isValidObjectId(id)) {
      return null;
    }
    return this.sessionModel.findById(id).exec();
  }

  public getByToken(token: string): Promise<Session | undefined> {
    return this.sessionModel.findOne({ token }).exec();
  }

  public getByUser(user: string): Promise<Session[]> {
    return this.sessionModel.find({ user }).exec();
  }

  public async createSession(
    userId: string,
    address: string,
    device: string,
  ): Promise<Session | undefined> {
    const session = new this.sessionModel({
      address,
      device: device || 'unknown',
      date: Date.now(),
      user: userId,
    });

    const payload = { id: userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env['JWT_SECRET'],
    });

    console.log('------> ' + session._id);
    return { ...session, token };
  }
}
import { Request } from 'express';

export type UserPayload = {
  id: number;
};

export interface RequestWithUser extends Request {
  user: UserPayload;
}

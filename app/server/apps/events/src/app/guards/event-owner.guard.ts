import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { Event, User } from '@app/common';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  constructor(private eventService: EventsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const eventId = request.params.eventId;

    if (!user) {
      throw new ForbiddenException('Access denied; register or try logging in');
    }

    const event = await this.getEventOrThrow(eventId);
    this.ensureUserIsAllowed(user, event);

    return true;
  }

  private async getEventOrThrow(eventId: string): Promise<Event> {
    const event = await this.eventService.getSingleEvent(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return event;
  }

  private ensureUserIsAllowed(user: User, event: Event): void {
    if (user.id !== event.user) {
      throw new ForbiddenException(
        'You are not authorized to manage tickets for this event'
      );
    }
  }
}

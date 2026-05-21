import { InvalidTransitionError, isValidTransition, type IncidentStatus } from '@plaksha/shared-types';
import { Injectable } from '@nestjs/common';

import { InvalidStateError } from '../../common/exceptions';

@Injectable()
export class LifecycleService {
  ensure(from: IncidentStatus, to: IncidentStatus): void {
    if (!isValidTransition(from, to)) {
      throw new InvalidStateError(new InvalidTransitionError(from, to).message);
    }
  }
}

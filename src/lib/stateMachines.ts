/**
 * Application State Machine
 * 
 * Explicit states for applications to prevent race conditions,
 * enable audits, and support kill-switch & rollback.
 * 
 * States:
 * - draft: Initial creation, not yet submitted
 * - submitted: Submitted by user, awaiting processing
 * - verifying: System checking verification requirements
 * - ai_review: Sent to LLM for risk analysis
 * - needs_human_review: Flagged for admin review
 * - approved: Approved by system or admin
 * - rejected: Rejected by system or admin
 * - expired: Time-based expiration
 */

export type ApplicationState = 
  | 'draft'
  | 'submitted'
  | 'verifying'
  | 'ai_review'
  | 'needs_human_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type SlotState = 
  | 'open'
  | 'reserved'
  | 'pending_verification'
  | 'filled'
  | 'released';

export type UserVerificationState = 
  | 'unverified'
  | 'partially_verified'
  | 'verified'
  | 'restricted'
  | 'suspended';

// Valid state transitions
const APPLICATION_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  draft: ['submitted'],
  submitted: ['verifying', 'rejected'],
  verifying: ['ai_review', 'needs_human_review', 'rejected'],
  ai_review: ['approved', 'needs_human_review', 'rejected'],
  needs_human_review: ['approved', 'rejected'],
  approved: ['expired'], // Can expire if not acted upon
  rejected: [], // Terminal state
  expired: [], // Terminal state
};

const SLOT_TRANSITIONS: Record<SlotState, SlotState[]> = {
  open: ['reserved'],
  reserved: ['pending_verification', 'released', 'open'],
  pending_verification: ['filled', 'released'],
  filled: ['released'],
  released: ['open'],
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  currentState: ApplicationState,
  newState: ApplicationState
): boolean {
  const validNextStates = APPLICATION_TRANSITIONS[currentState];
  return validNextStates.includes(newState);
}

/**
 * Check if a slot state transition is valid
 */
export function isValidSlotTransition(
  currentState: SlotState,
  newState: SlotState
): boolean {
  const validNextStates = SLOT_TRANSITIONS[currentState];
  return validNextStates.includes(newState);
}

/**
 * Get next valid states for an application
 */
export function getValidNextStates(currentState: ApplicationState): ApplicationState[] {
  return APPLICATION_TRANSITIONS[currentState] || [];
}

/**
 * Get next valid states for a slot
 */
export function getValidSlotNextStates(currentState: SlotState): SlotState[] {
  return SLOT_TRANSITIONS[currentState] || [];
}

/**
 * Determine user verification state based on profile
 */
export function getUserVerificationState(profile: {
  id_verified?: boolean;
  income_verified?: boolean;
  is_suspended?: boolean;
  fraud_flags?: string[];
}): UserVerificationState {
  if (profile.is_suspended) {
    return 'suspended';
  }
  
  if (profile.fraud_flags && profile.fraud_flags.length > 0) {
    return 'restricted';
  }
  
  if (profile.id_verified && profile.income_verified) {
    return 'verified';
  }
  
  if (profile.id_verified || profile.income_verified) {
    return 'partially_verified';
  }
  
  return 'unverified';
}

/**
 * State machine for processing applications
 */
export interface ApplicationStateMachine {
  currentState: ApplicationState;
  applicationId: string;
  history: Array<{
    from: ApplicationState;
    to: ApplicationState;
    timestamp: string;
    reason?: string;
  }>;
}

export function createApplicationStateMachine(
  applicationId: string,
  initialState: ApplicationState = 'draft'
): ApplicationStateMachine {
  return {
    currentState: initialState,
    applicationId,
    history: [],
  };
}

export function transitionApplication(
  machine: ApplicationStateMachine,
  newState: ApplicationState,
  reason?: string
): { success: boolean; error?: string; machine: ApplicationStateMachine } {
  if (!isValidTransition(machine.currentState, newState)) {
    return {
      success: false,
      error: `Invalid transition from ${machine.currentState} to ${newState}`,
      machine,
    };
  }

  const updatedMachine: ApplicationStateMachine = {
    ...machine,
    currentState: newState,
    history: [
      ...machine.history,
      {
        from: machine.currentState,
        to: newState,
        timestamp: new Date().toISOString(),
        reason,
      },
    ],
  };

  return {
    success: true,
    machine: updatedMachine,
  };
}

/**
 * Slot state machine for managing property slots
 */
export interface SlotStateMachine {
  currentState: SlotState;
  propertyId: string;
  slotIndex: number;
  reservedBy?: string;
  reservedAt?: string;
  expiresAt?: string;
}

export function createSlotStateMachine(
  propertyId: string,
  slotIndex: number,
  initialState: SlotState = 'open'
): SlotStateMachine {
  return {
    currentState: initialState,
    propertyId,
    slotIndex,
  };
}

export function transitionSlot(
  machine: SlotStateMachine,
  newState: SlotState,
  options?: { reservedBy?: string; expiresAt?: string }
): { success: boolean; error?: string; machine: SlotStateMachine } {
  if (!isValidSlotTransition(machine.currentState, newState)) {
    return {
      success: false,
      error: `Invalid slot transition from ${machine.currentState} to ${newState}`,
      machine,
    };
  }

  const updatedMachine: SlotStateMachine = {
    ...machine,
    currentState: newState,
    reservedBy: newState === 'reserved' ? options?.reservedBy : machine.reservedBy,
    reservedAt: newState === 'reserved' ? new Date().toISOString() : machine.reservedAt,
    expiresAt: newState === 'reserved' ? options?.expiresAt : machine.expiresAt,
  };

  // Clear reservation info on release
  if (newState === 'released' || newState === 'open') {
    updatedMachine.reservedBy = undefined;
    updatedMachine.reservedAt = undefined;
    updatedMachine.expiresAt = undefined;
  }

  return {
    success: true,
    machine: updatedMachine,
  };
}

/**
 * Check if a reservation has expired
 */
export function isReservationExpired(machine: SlotStateMachine): boolean {
  if (machine.currentState !== 'reserved' || !machine.expiresAt) {
    return false;
  }
  return new Date(machine.expiresAt) < new Date();
}

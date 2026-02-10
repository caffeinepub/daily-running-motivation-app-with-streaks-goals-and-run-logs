export interface RunLogValidation {
  timeMinutes: number;
  distance?: number;
}

export function validateRunLog(data: RunLogValidation): Record<string, string> {
  const errors: Record<string, string> = {};

  if (isNaN(data.timeMinutes) || data.timeMinutes <= 0) {
    errors.timeMinutes = 'Duration must be a positive number';
  } else if (data.timeMinutes > 1440) {
    errors.timeMinutes = 'Duration cannot exceed 24 hours (1440 minutes)';
  }

  if (data.distance !== undefined) {
    if (isNaN(data.distance) || data.distance < 0) {
      errors.distance = 'Distance cannot be negative';
    } else if (data.distance > 1000) {
      errors.distance = 'Distance seems unreasonably high (max 1000)';
    }
  }

  return errors;
}

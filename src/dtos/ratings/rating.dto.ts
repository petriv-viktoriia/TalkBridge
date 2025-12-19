export class RatingDto {
  id: number;
  raterId: number;
  ratedId: number;
  score: number;
  createdAt: Date;
  updatedAt: Date;
  raterProfile?: any;
  ratedProfile?: any;
}

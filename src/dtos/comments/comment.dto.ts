export class CommentDto {
  id: number;
  authorId: number;
  profileId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author?: any;
  profile?: any;
}

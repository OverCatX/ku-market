export interface Review {
  _id: string;
  itemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean; // verified purchase
  hasVoted?: boolean; // Whether current user has marked this review as helpful
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewInput {
  rating: number;
  title?: string;
  comment: string;
  images?: File[];
}


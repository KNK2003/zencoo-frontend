export type Post = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likeCount?: number;
  comments?: string[];
  isLiked?: boolean;
  user?: {
    id: number;
    username: string;
    profilePic?: string;
    displayName?: string;
  };
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  wing: string;
  door: string;
  bio: string;
  hometown: string;
  profilePic: string;
  headerBg: string | null;
  friends: number;
  posts: Post[];
  email: string;
};

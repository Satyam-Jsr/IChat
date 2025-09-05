import { Id } from "../../convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  image: string;
  name?: string;
  tokenIdentifier: string;
  email: string;
  _creationTime: number;
  isOnline: boolean;
}

export interface Message {
  _id: Id<"messages">;
  content: string;
  _creationTime: number;
  messageType: "text" | "image" | "video" | "audio";
  isDeleted?: boolean;
  deletedBy?: string;
  sender: User;
}

export interface Conversation {
  _id: Id<"conversations">;
  image?: string;
  participants: Id<"users">[];
  isGroup: boolean;
  name?: string;
  groupImage?: string;
  groupName?: string;
  admin?: Id<"users">;
  isOnline?: boolean;
  _creationTime: number;
  lastMessage?: {
    _id: Id<"messages">;
    conversation: Id<"conversations">;
    content: string;
    messageType: "text" | "image" | "video" | "audio";
    _creationTime: number;
    isDeleted?: boolean;
    deletedBy?: string;
    sender: Id<"users">;
  };
}

export type MediaFile = {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
};

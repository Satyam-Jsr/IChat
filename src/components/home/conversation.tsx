import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon, Mic } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import { Conversation as ConversationType } from "@/types";
import { useMemo, useState } from "react";
import ConversationContextMenu from "./conversation-context-menu";

const Conversation = ({ conversation }: { conversation: ConversationType }) => {
	const conversationImage = conversation.groupImage|| conversation.image;
	const conversationName = conversation.groupName || conversation.name;
	const lastMessage = conversation.lastMessage;
	const lastMessageType = lastMessage?.messageType;
	const lastMessageSender = useQuery(api.users.getUserById, 
		lastMessage?.sender ? { userId: lastMessage.sender } : "skip"
	);
	const me= useQuery(api.users.getMe);
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	const {setSelectedConversation,selectedConversation}=useConversationStore();
	const activeBgClass = selectedConversation?._id === conversation._id;
	return (
		<>
			<div 
				className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer relative
					${activeBgClass ? "bg-gray-tertiary": ""}
				`}
				onClick={() => setSelectedConversation(conversation)}
				onContextMenu={(e) => {
					e.preventDefault();
					setShowContextMenu(true);
					setMenuPosition({ x: e.clientX, y: e.clientY });
				}}
			>
				<Avatar className='border border-gray-900 overflow-visible relative'>
					{conversation.isOnline && (
						<div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
					)}
					<AvatarImage src={conversationImage || "/placeholder.png"} className='object-cover rounded-full' />
					<AvatarFallback>
						<div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
					</AvatarFallback>
				</Avatar>
				<div className='w-full'>
					<div className='flex items-center'>
						<h3 className='text-xs lg:text-sm font-medium'>{conversationName}</h3>
						<span className='text-[10px] lg:text-xs text-gray-500 ml-auto'>
							{formatDate(lastMessage?._creationTime || conversation._creationTime)}
						</span>
					</div>
					<p className='text-[12px] mt-1 text-gray-500 flex items-center gap-1 '>
						{!lastMessage && "Say Hi!"}
						{lastMessage?.isDeleted ? (
							<span className='italic text-gray-400'>This message is deleted</span>
						) : lastMessage ? (
							<>
								{!conversation.isGroup && lastMessage.sender === me?._id && <MessageSeenSvg />}
								{conversation.isGroup && (
									<>
										{lastMessage.sender === me?._id ? (
											<span className='text-xs font-semibold text-primary'>You: </span>
										) : lastMessageSender && (
											<span className='text-xs font-semibold text-primary'>{lastMessageSender.name?.split(" ")[0]}: </span>
										)}
									</>
								)}
								{lastMessageType === "text" && lastMessage.content ? (
									lastMessage.content.length > 30 ? (
										<span className='text-xs'>{lastMessage.content.slice(0, 30)}...</span>
									) : (
										<span className='text-xs'>{lastMessage.content}</span>
									)
								) : null}
								{lastMessageType === "image" && <><ImageIcon size={16} /> <span className='text-xs'>Image</span></>}
								{lastMessageType === "video" && <><VideoIcon size={16} /> <span className='text-xs'>Video</span></>}
								{lastMessageType === "audio" && <><Mic size={16} /> <span className='text-xs'>Audio message</span></>}
							</>
						) : null}
					</p>
				</div>
			</div>
			<hr className='h-[1px] mx-10 bg-gray-primary' />
			{showContextMenu && (
				<ConversationContextMenu
					conversationId={conversation._id}
					onClose={() => setShowContextMenu(false)}
					position={menuPosition}
				/>
			)}
		</>
	);
};
export default Conversation;
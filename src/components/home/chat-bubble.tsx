import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/store/chat-store";
import ChatBubbleAvatar from "./chat-bubble-avatar";
import DateIndicator from "./date-indicator";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogTrigger } from "../ui/dialog";
import ChatAvatarActions from "./chat-avatar-actions";
import MessageContextMenu from "./message-context-menu";

import { User, Message } from "@/types";

type ChatBubbleProps = {
	message: Message;
	me: User;
	previousMessage?: Message;
}

const ChatBubble = ({me,message,previousMessage}:ChatBubbleProps) => {
	const date=new Date(message._creationTime);
	const hour= date.getHours().toString().padStart(2,"0");
	const minute= date.getMinutes().toString().padStart(2,"0");
	const time= `${hour}:${minute}`;

	const {selectedConversation}= useConversationStore();
	const isMember= selectedConversation?.participants.includes(message.sender._id) || false;
	const isGroup= selectedConversation?.isGroup;
	const fromMe = message.sender._id === me._id;
	const bgClass= fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary";
	
	const [open, setOpen]=useState(false);
	const [showContextMenu, setShowContextMenu] = useState(false);
	const isDeleted = message.isDeleted || false;

	const renderMessageContent =()=> {
		if (isDeleted) {
			return <DeletedMessage />;
		}
		
		switch(message.messageType)
		{
			case "text":
				return <TextMessage message={message}/>;
			case "image":
				return <ImageMessage message={message}
		handleClick={()=> setOpen(true)}/>;
			case "audio":
				return <AudioMessage message={message} />;
		    case "video":
		        return <VideoMessage message={message}/>;
			default:
				return null;



		}
	}

	if(!fromMe){
		return (
	<>
	<DateIndicator message={message} previousMessage={previousMessage}/>
	<div className="flex gap-1 w-2/3">
	<ChatBubbleAvatar
	 isGroup={isGroup}
	 isMember={isMember}
	 message={message}/>
	<div 
		className={`flex flex-col max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass} ${isDeleted ? 'opacity-60' : ''}`}
		onContextMenu={(e) => {
			e.preventDefault();
			if (fromMe) {
				setShowContextMenu(true);
			}
		}}
	>
		<OtherMessageIndicator/>
		{isGroup && <ChatAvatarActions
		message={message}
	    me={me}
       />}
		{renderMessageContent()}
		{open && <ImageDialog
		src={message.content}
		open={open}
		onClose={()=>setOpen(false)}
		/>}
		<MessageTime
		time={time}
		fromMe={fromMe}
		/>
		{showContextMenu && fromMe && (
			<MessageContextMenu
				messageId={message._id}
				isFromMe={fromMe}
				onClose={() => setShowContextMenu(false)}
			/>
		)}
	</div>
	
	</div>
	</>
	)
};
	return <>
	<DateIndicator message={message} previousMessage={previousMessage}/>
	<div className="flex gap-1 w-2/3 ml-auto">
	<div 
		className={`flex max-w-fit px-2 pt-1 rounded-md shadow-md ml-auto relative ${bgClass} ${isDeleted ? 'opacity-60' : ''}`}
		onContextMenu={(e) => {
			e.preventDefault();
			if (fromMe) {
				setShowContextMenu(true);
			}
		}}
	>
		<SelfMessageIndicator/>
		{renderMessageContent()}
		{open && <ImageDialog
		src={message.content}
		open={open}
		onClose={()=>setOpen(false)}
		/>}
		<MessageTime
		time={time}
		fromMe={fromMe}
		/>
		{showContextMenu && fromMe && (
			<MessageContextMenu
				messageId={message._id}
				isFromMe={fromMe}
				onClose={() => setShowContextMenu(false)}
			/>
		)}
	</div>
	</div>
	
	</>
};
export default ChatBubble;
const VideoMessage = ({ message }: { message: IMessage }) => {
  const [showVideo, setShowVideo] = useState(false);

	return (
		<div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center shadow-md">
			{showVideo ? (
				<video
					src={message.content}
					controls
					autoPlay
					className="w-full h-full object-contain bg-black rounded-lg"
				/>
			) : (
				<button
					onClick={() => setShowVideo(true)}
					className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 hover:bg-opacity-40 transition"
				>
					<svg
						viewBox="0 0 24 24"
						className="h-16 w-16 drop-shadow-xl fill-white opacity-90"
					>
						<polygon points="8,5 19,12 8,19" />
					</svg>
				</button>
			)}
		</div>
	);
};
const ImageMessage= ({message, handleClick }: {message: IMessage, handleClick: ()=>void})=>
{
	return (
		<div className="w-[250px] h-[250px] m-2 relative cursor-pointer" onClick={handleClick}>
			<Image
			src={message.content}
			fill
			className="cursor-pointer object-cover rounded"
			sizes="250px"
			alt="image"
			/>
		</div>
		
	)
}
const ImageDialog = ({ src, onClose, open }: { open: boolean; src: string; onClose: () => void }) => {
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			 <DialogContent
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-0"
    >
     
      <DialogClose asChild>
            <button
    aria-label="Close"
    className="absolute top-5 right-40 py-2 px-6 text-lg text-gray-300 hover:text-white"
  >
    x
  </button>
          </DialogClose>
	   <DialogTitle className="sr-only">Image Preview</DialogTitle>
      <DialogDescription className="max-h-[90vh] max-w-screen-lg w-full flex justify-center pointer-events-none">
        <Image
          src={src}
          width={800}               
          height={600}
          alt="image"
          className="h-full w-auto object-contain rounded-lg pointer-events-none"
          unoptimized               
        />
      </DialogDescription>
    </DialogContent>
		</Dialog>
	);
};

const AudioMessage = ({ message }: { message: IMessage }) => {
	return (
		<div className="w-[250px] m-2">
			<audio controls src={message.content} className="w-full">
				Your browser does not support the audio element.
			</audio>
		</div>
	);
};

const MessageTime=({time,fromMe}:{time:string;fromMe: boolean})=>{
	return (
		<p className='text-[10px] mt-2 self-end flex gap-1 items-center'>
			{time} {fromMe && <MessageSeenSvg/>}
		</p>
	)
}

const OtherMessageIndicator=()=>(
	<div className='absolute bg-white dark:bg-gray-primary top-0 -left-1 w-3 h-3 rounded-bl-full'/>
);

const SelfMessageIndicator =()=>(
	<div className='absolute bg-green-chat top-0 -right-1 w-3 h-3 rounded-br-full overflow-hidden'/>
);

const TextMessage= ({message}:{message:IMessage}) =>
{
	const isLink= /^(ftp|http|https):\/\/[^ "]+$/.test(message.content);

	return (
		<div>
			{isLink ? (
				<a
				href={message.content}
				target='_blank'
				rel='noopener noreferrer'
				className={`mr-2 text-sm font-dark text-blue-400 underline`}
				>
					{message.content}
				</a>
			):
			( 
				<p className={`mr-2 text-sm font-dark`}> {message.content} </p>
			)}
		</div>
	);
};

const DeletedMessage = () => {
	return (
		<div className="flex items-center gap-2 mr-2 text-sm text-gray-500 dark:text-gray-400 italic">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
			</svg>
			<span>This message is deleted</span>
		</div>
	);
};

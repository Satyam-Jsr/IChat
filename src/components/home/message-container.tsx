import ChatBubble from "./chat-bubble";
import { useConversationStore } from "@/store/chat-store";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useRef } from "react";

const MessageContainer = () => {
	const {selectedConversation}=useConversationStore();
	const me = useQuery(api.users.getMe);
	const containerRef = useRef<HTMLDivElement>(null);

	const messages = useQuery(api.messages.getMessages, 
		selectedConversation ? { conversation: selectedConversation._id } : "skip"
	);

	// Function to instantly scroll to bottom without any animations
	const scrollToBottom = () => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	};

	// Instant scroll when messages update or conversation changes
	useEffect(() => {
		if (messages?.length || selectedConversation) {
			requestAnimationFrame(scrollToBottom);
		}
	}, [messages?.length, selectedConversation]);

	// Early return if me is not loaded yet
	if (!me) return null;

	return (
		<div ref={containerRef} className='relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark' style={{ scrollBehavior: 'auto' }}>
			<div className='mx-12 flex flex-col gap-3'>
				{messages?.map((msg, idx) => (
					<div key={msg._id}>
						<ChatBubble
							message={msg} 
							me={me}
							previousMessage={idx > 0 ? messages[idx-1] : undefined}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
export default MessageContainer;
import ChatBubble from "./chat-bubble";
import { useConversationStore } from "@/store/chat-store";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useRef } from "react";

const MessageContainer = () => {
	const {selectedConversation}=useConversationStore();
	const messages = useQuery(api.messages.getMessages, {
		conversation: selectedConversation!._id
	});

	const me = useQuery(api.users.getMe);
	const lastMessageRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Early return if me is not loaded yet
	if (!me) return null;

	// Function to instantly scroll to bottom without any animations
	const scrollToBottom = () => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	};

	// Instant scroll when conversation changes
	useEffect(() => {
		if (selectedConversation) {
			// Use a small timeout to ensure DOM is updated
			requestAnimationFrame(scrollToBottom);
		}
	}, [selectedConversation?._id]);

	// Instant scroll when messages update
	useEffect(() => {
		if (messages?.length) {
			requestAnimationFrame(scrollToBottom);
		}
	}, [messages?.length]);

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
import { Laugh, Mic, Square, Send } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { mutation } from "../../../convex/_generated/server";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useConversationStore } from "@/store/chat-store";
import toast from "react-hot-toast";
import useComponentVisible from "@/hooks/useComponentVisible";
import EmojiPicker, {Theme} from "emoji-picker-react";
import MediaDropdown from "./media-dropdown";

const MessageInput = () => {
	const [msgText, setMsgText] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const recordedChunksRef = useRef<Blob[]>([]);
	const sendTextMsg= useMutation(api.messages.sendTextMessage);
	const sendAudioMsg = useMutation(api.messages.sendAudio);
	const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
	const me= useQuery(api.users.getMe);
	const {selectedConversation}=useConversationStore();

	const {ref,isComponentVisible,setIsComponentVisible}=useComponentVisible(false);

	const handleSendTextMsg= async (e: React.FormEvent)=>{
		e.preventDefault();
		
		// Prevent multiple submissions
		if (isSending || !msgText.trim() || !selectedConversation || !me) {
			return;
		}

		setIsSending(true);
		try
		{
			await sendTextMsg({content: msgText.trim(), conversation: selectedConversation._id, sender: me._id})
			setMsgText('')
		}
		catch(err: any){
			toast.error(err.message);
			console.error(err);
		}
		finally {
			setIsSending(false);
		}
	}

	const startRecording = async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			toast.error("Audio recording not supported");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			recordedChunksRef.current = [];
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunksRef.current.push(event.data);
				}
			};
			mediaRecorder.onstop = async () => {
				try {
					const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
					if (audioBlob.size === 0) return;
					const uploadUrl = await generateUploadUrl();
					const res = await fetch(uploadUrl, {
						method: "POST",
						headers: { "Content-Type": audioBlob.type },
						body: audioBlob,
					});
					const { storageId } = await res.json();
					await sendAudioMsg({ audioId: storageId, conversation: selectedConversation!._id, sender: me!._id });
				} catch (error: any) {
					console.error(error);
					toast.error("Failed to send audio");
				} finally {
					setIsRecording(false);
				}
			};
			mediaRecorder.start();
			mediaRecorderRef.current = mediaRecorder;
			setIsRecording(true);
		} catch (error: any) {
			console.error(error);
			toast.error("Microphone permission denied");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
			mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
		}
	};

	return (
		<div className='bg-gray-primary p-2 flex gap-4 items-center'>
			<div className='relative flex gap-2 ml-2'>
				<div ref={ref} onClick={()=> setIsComponentVisible(v => !v)}>
					{isComponentVisible && (
						<EmojiPicker
						theme={Theme.DARK}
						onEmojiClick={(emojiObject)=> {
							setMsgText(prev=>prev+emojiObject.emoji)
						}}
						style={{position: "absolute",bottom: "1.5rem",left: "1rem", zIndex: 50}}
					/>
					)}
				<Laugh className='text-gray-600 dark:text-gray-400' />
				</div>
				<MediaDropdown/>
			</div>
			<form onSubmit={handleSendTextMsg} className='w-full flex gap-3' key={selectedConversation?._id}>
				<div className='flex-1'>
					<Input
						type='text'
						placeholder='Type a message'
						className='py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent'
						value={msgText}
						onChange={(e) => setMsgText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSendTextMsg(e);
							}
						}}
						disabled={isSending}
					/>
				</div>
				<div className='mr-4 flex items-center gap-3'>
					{msgText.length > 0 ? (
						<Button
							type='submit'
							size={"sm"}
							disabled={isSending}
							className='bg-transparent text-foreground hover:bg-transparent disabled:opacity-50'
						>
							<Send />
						</Button>
					) : (
						<Button
							type='button'
							size={"sm"}
							onClick={isRecording ? stopRecording : startRecording}
							className='bg-transparent text-foreground hover:bg-transparent'
						>
							{isRecording ? <Square /> : <Mic />}
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};
export default MessageInput;
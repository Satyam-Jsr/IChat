import { MessageSquareText } from "lucide-react";
import Image from "next/image";

const ChatPlaceHolder = () => {
	return (
		<div className='w-3/4 bg-gray-secondary flex flex-col items-center justify-center'>
			<div className='flex flex-col items-center gap-6'>
				<div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center p-4">
					<Image
						src="/favicon.ico"
						alt="IChat Logo"
						width={80}
						height={80}
						className="object-contain"
					/>
				</div>
				<div className="text-center">
					<h1 className='text-4xl font-bold text-blue-400 mb-4'>Welcome to IChat</h1>
					<p className='text-gray-600 text-lg max-w-md text-center'>
						Select a conversation or start a new chat to begin messaging
					</p>
				</div>
			</div>
		</div>
	);
};
export default ChatPlaceHolder;
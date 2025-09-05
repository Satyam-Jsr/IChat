import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(date_ms: number) {
	const date_seconds = date_ms / 1000;

	const date_obj = new Date(date_seconds * 1000);

	const current_date = new Date();
	current_date.setHours(0, 0, 0, 0);
	const current_time = current_date.getTime();

	const provided_date = new Date(date_obj);
	provided_date.setHours(0, 0, 0, 0);

	if (provided_date.getTime() === current_time) {
		return date_obj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
	}

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0, 0, 0, 0);
	if (provided_date.getTime() === yesterday.getTime()) {
		return "Yesterday";
	}

	if (provided_date.getDay() < current_date.getDay()) {
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return days[provided_date.getDay()];
	}

	return provided_date.getMonth() + 1 + "/" + provided_date.getDate() + "/" + provided_date.getFullYear();
}

export const isSameDay=(timeStamp1: number, timeStamp2: number): boolean=> {
	const date1=new Date(timeStamp1);
	const date2=new Date(timeStamp2);
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
};

interface Message {
    _creationTime: number;
}

export const getRelativeTime =(message: Message, previousMessage: Message | undefined)=>{
	const today=new Date();
	const yesterday= new Date(today);
	yesterday.setDate(yesterday.getDate()-1);
	const lastWeek= new Date(today);
	lastWeek.setDate(lastWeek.getDate()-7);

	const messageDate= new Date(message._creationTime);

	if(!previousMessage || !isSameDay(previousMessage._creationTime, messageDate.getTime())){
		if(isSameDay(messageDate.getTime(),today.getTime())){
			return "Today";
		}
		else if(isSameDay(messageDate.getTime(),yesterday.getTime())){
			return "Yesterday";
		}
		else if(messageDate.getTime()>lastWeek.getTime())
		{
			const options: Intl.DateTimeFormatOptions ={
				weekday:"long",
			};
			return messageDate.toLocaleDateString(undefined,options);
		} else{
			const options: Intl.DateTimeFormatOptions ={
				day:"2-digit",
				month: "2-digit",
				year: "numeric",
			};
			return messageDate.toLocaleDateString(undefined,options);
		}
	}
};

export function randomID(len: number) {
	let result = "";
	const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
	const maxPos = chars.length;
	len = len || 5;
	for (let i = 0; i < len; i++) {
		result += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return result;
}

export type ChatData = {
	id: string;
	users: {
		id: string;
		name: string;
		email: string;
		events_seen_up_to: string;
		type: string;
		present: boolean;
		created_at?: string;
		last_visit?: {
			id: number;
			started_at: string;
			ended_at: string;
			ip: string;
			user_agent: string;
			geolocation: {
				country: string;
				country_code: string;
				region: string;
				city: string;
				timezone: string;
				latitude: string;
				longitude: string;
			};
			last_pages: {
				opened_at: string;
				url: string;
				title: string;
			}[];
			previous_visit_started_at: string;
		};
		statistics?: {
			chats_count: number;
			threads_count: number;
			visits_count: number;
			page_views_count: number;
			greetings_shown_count: number;
			greetings_accepted_count: number;
		};
		agent_last_event_created_at?: string;
		customer_last_event_created_at?: string;
		email_verified?: boolean;
		avatar?: string;
		visibility?: string;
	}[];
	thread: {
		id: string;
		active: boolean;
		user_ids: string[];
		properties: {
			routing: {
				continuous: boolean;
				idle?: boolean;
				referrer?: string;
				start_url?: string;
				unassigned?: boolean;
				pinned?: boolean;
				was_pinned?: boolean;
			};
			source: {
				client_id: string;
				customer_client_id?: string;
			};
		};
		access: {
			group_ids: number[];
		};
		previous_thread_id: string;
		next_thread_id: string;
		previous_accessible_thread_id: string;
		next_accessible_thread_id: string;
		created_at: string;
		events: {
			id: string;
			created_at: string;
			visibility: string;
			type: string;
			properties?: {
				source: {
					client_id: string;
				};
			};
			text?: string;
			author_id?: string;
			custom_id?: string;
			system_message_type?: string;
			text_vars?: {
				agent_added?: string;
				agent_removed?: string;
				agent?: string;
			};
		}[];
	};
	properties: {
		routing: {
			continuous: boolean;
			pinned?: boolean;
			was_pinned?: boolean;
		};
		source: {
			client_id: string;
			customer_client_id?: string;
		};
		supervising?: {
			agent_ids: string;
		};
	};
	access: {
		group_ids: number[];
	};
	is_followed: boolean;
};

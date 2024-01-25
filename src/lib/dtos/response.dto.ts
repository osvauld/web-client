import { GroupWithAccessType } from './group.dto'
import { UserWithAccessType, User } from './user.dto';
import { Folder } from './folder.dto';

export type BaseResponse = {
    success: boolean;
    message: string;
}

export type ChallengeResponse = BaseResponse & {
    data: {
        challenge: string;
    }
}

export type AuthResponse = BaseResponse & {
    data: {
        token: string;
    }
}

export type FolderGroupResponse = BaseResponse & {
    data: GroupWithAccessType[];
}

export type FolderUserResponse = BaseResponse & {
    data: UserWithAccessType[];
}
// TODO: change fetchallfolders api 
export type FetchFoldersResponse = BaseResponse & {
    data: Folder[];
}


export type FetchAllUsersResponse = BaseResponse & {
    data: User[]
}
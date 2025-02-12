export type JWTPayloadType = {
  id: number;
  username: string;
  email: string;
  role:string 
  profileImage: ProfileImageType; 
}


export type AccessTokenType = {
  accessToken: string
}

export type ProfileImageType = {
  secure_url: string;
  public_id: string;
}
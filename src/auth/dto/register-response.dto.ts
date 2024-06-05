import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    description: 'Email of the user',
  })
  email: string;
}

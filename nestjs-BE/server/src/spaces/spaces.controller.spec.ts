import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile, Space } from '@prisma/client';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { UpdateSpaceRequestDto } from './dto/update-space.dto';
import { CreateSpaceRequestDto } from './dto/create-space.dto';

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: SpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        {
          provide: SpacesService,
          useValue: {
            createSpace: jest.fn(),
            findSpace: jest.fn(),
            updateSpace: jest.fn(),
            joinSpace: jest.fn(),
            leaveSpace: jest.fn(),
            findProfilesInSpace: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get<SpacesService>(SpacesService);
  });

  it('create created', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const userUuidMock = 'user uuid';
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: userUuidMock,
    } as Profile;
    const bodyMock = {
      name: 'new space name',
      profileUuid: profileMock.uuid,
    } as CreateSpaceRequestDto;
    const spaceMock = { uuid: 'space uuid' } as Space;

    (spacesService.createSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.createSpace(iconMock, bodyMock, userUuidMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: spaceMock,
    });
    expect(spacesService.createSpace).toHaveBeenCalledWith(
      userUuidMock,
      bodyMock.profileUuid,
      iconMock,
      bodyMock,
    );
  });

  it('create profile uuid needed', async () => {
    const userUuidMock = 'user uuid';
    const bodyMock = {
      name: 'new space name',
    } as CreateSpaceRequestDto;

    const response = controller.createSpace(
      undefined as Express.Multer.File,
      bodyMock,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
    expect(spacesService.createSpace).not.toHaveBeenCalled();
  });

  it('findOne found space', async () => {
    const profileUuid = 'profile uuid';
    const spaceMock = { uuid: 'space uuid' } as Space;
    const userUuidMock = 'user uuid';

    (spacesService.findSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.findSpace(
      spaceMock.uuid,
      profileUuid,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
  });

  it('findOne profile_uuid missing', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const userUuidMock = 'user uuid';

    const response = controller.findSpace(
      spaceMock.uuid,
      undefined,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
  });

  it('updateSpace update space', async () => {
    const spaceUuid = 'space uuid';
    const profileUuid = 'profile uuid';
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const userUuidMock = 'user uuid';
    const spaceMock = { uuid: spaceUuid } as Space;

    (spacesService.updateSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.updateSpace(
      iconMock,
      spaceUuid,
      profileUuid,
      bodyMock,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
  });

  it('updateSpace profile uuid needed', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const spaceUuid = 'space uuid';
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const userUuidMock = 'user uuid';

    const response = controller.updateSpace(
      iconMock,
      spaceUuid,
      undefined,
      bodyMock,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
    expect(spacesService.updateSpace).not.toHaveBeenCalled();
  });

  it('joinSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const bodyMock = { profileUuid: 'profile uuid' };
    const userUuidMock = 'user uuid';

    (spacesService.joinSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.joinSpace(
      spaceMock.uuid,
      bodyMock,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: spaceMock,
    });
  });

  it('leaveSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };
    const userUuidMock = 'user uuid';

    (spacesService.leaveSpace as jest.Mock).mockResolvedValue(undefined);

    const response = controller.leaveSpace(
      spaceMock.uuid,
      profileMock.uuid,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
    });
  });

  it('findProfilesInSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };
    const userUuidMock = 'user uuid';
    const profilesMock = [];

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue(
      profilesMock,
    );

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      profileMock.uuid,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: profilesMock,
    });
  });

  it('findProfilesInSpace space uuid needed', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const userUuidMock = 'user uuid';

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue([]);

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      undefined,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
  });
});

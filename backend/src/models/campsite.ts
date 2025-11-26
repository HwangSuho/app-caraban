import {
  CreationOptional,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

export interface CampsiteAttributes {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  pricePerNight: number;
  hostId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CampsiteCreationAttributes = Optional<
  CampsiteAttributes,
  "id" | "description" | "location" | "hostId"
>;

export class Campsite
  extends Model<CampsiteAttributes, CampsiteCreationAttributes>
  implements CampsiteAttributes
{
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare location: string | null;
  declare pricePerNight: number;
  declare hostId: number | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export const initCampsiteModel = (sequelize: Sequelize) => {
  Campsite.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pricePerNight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      hostId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "campsites",
      modelName: "Campsite",
    }
  );

  return Campsite;
};

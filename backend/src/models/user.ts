import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from "sequelize";

export type UserRole = "user" | "host" | "admin";

export interface UserAttributes {
  id: number;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "role" | "email" | "name"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: CreationOptional<number>;
  declare firebaseUid: string;
  declare email: string | null;
  declare name: string | null;
  declare role: UserRole;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      firebaseUid: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("user", "host", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );

  return User;
};

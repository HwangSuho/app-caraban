import {
  CreationOptional,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface ReservationAttributes {
  id: number;
  userId: number;
  campsiteId: number;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type ReservationCreationAttributes = Optional<
  ReservationAttributes,
  "id" | "status"
>;

export class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  declare id: CreationOptional<number>;
  declare userId: number;
  declare campsiteId: number;
  declare startDate: Date;
  declare endDate: Date;
  declare status: ReservationStatus;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export const initReservationModel = (sequelize: Sequelize) => {
  Reservation.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      campsiteId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "reservations",
      modelName: "Reservation",
    }
  );

  return Reservation;
};

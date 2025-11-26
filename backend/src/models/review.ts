import {
  CreationOptional,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

export interface ReviewAttributes {
  id: number;
  userId: number;
  campsiteId: number;
  rating: number;
  comment: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ReviewCreationAttributes = Optional<ReviewAttributes, "id" | "comment">;

export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  declare id: CreationOptional<number>;
  declare userId: number;
  declare campsiteId: number;
  declare rating: number;
  declare comment: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export const initReviewModel = (sequelize: Sequelize) => {
  Review.init(
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
      rating: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "reviews",
      modelName: "Review",
    }
  );

  return Review;
};

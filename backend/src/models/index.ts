import { sequelize, connectDatabase } from "../config/database";
import { logger } from "../utils/logger";
import { initUserModel, User } from "./user";
import { initCampsiteModel, Campsite } from "./campsite";
import { initReservationModel, Reservation } from "./reservation";
import { initReviewModel, Review } from "./review";

let initialized = false;

const initModels = () => {
  initUserModel(sequelize);
  initCampsiteModel(sequelize);
  initReservationModel(sequelize);
  initReviewModel(sequelize);

  User.hasMany(Campsite, { foreignKey: "hostId", as: "campsites" });
  Campsite.belongsTo(User, { foreignKey: "hostId", as: "host" });

  User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });
  Reservation.belongsTo(User, { foreignKey: "userId", as: "guest" });

  Campsite.hasMany(Reservation, {
    foreignKey: "campsiteId",
    as: "reservations",
  });
  Reservation.belongsTo(Campsite, {
    foreignKey: "campsiteId",
    as: "campsite",
  });

  User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
  Review.belongsTo(User, { foreignKey: "userId", as: "author" });

  Campsite.hasMany(Review, { foreignKey: "campsiteId", as: "reviews" });
  Review.belongsTo(Campsite, {
    foreignKey: "campsiteId",
    as: "campsite",
  });

  initialized = true;
};

export async function initDatabase() {
  if (initialized) return;
  await connectDatabase();
  initModels();
  await sequelize.sync();
  logger.info("Database synced");
}

export { sequelize, User, Campsite, Reservation, Review };

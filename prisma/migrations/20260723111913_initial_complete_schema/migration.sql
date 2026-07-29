-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'CLIENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REFUSED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_ADMIN', 'NO_SHOW', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'PAYPAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('WEBSITE', 'GOOGLE', 'FACEBOOK', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_CREATED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_REFUSED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_REMINDER', 'MESSAGE_RECEIVED', 'REVIEW_RECEIVED', 'REVIEW_REQUEST', 'PROMOTION', 'CONTEST', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SERVICE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'CLOSED', 'DRAWN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VipProgramStatus" AS ENUM ('DISABLED', 'PRE_LAUNCH', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "VipAssistantMode" AS ENUM ('DISABLED', 'ADVICE_ONLY', 'SEMI_AUTOMATIC');

-- CreateEnum
CREATE TYPE "VipVisibility" AS ENUM ('PRIVATE', 'MEMBERS_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'SPEND', 'ADJUSTMENT', 'EXPIRATION', 'REFUND', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionSource" AS ENUM ('APPOINTMENT_CREATED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_COMPLETED', 'APPOINTMENT_PAYMENT', 'APPOINTMENT_CANCELLED', 'REVIEW_WEBSITE', 'REVIEW_GOOGLE', 'REFERRAL', 'CONTEST', 'CONTEST_WIN', 'CHALLENGE', 'ACHIEVEMENT', 'BADGE', 'LEVEL_UP', 'SEASON_PASS', 'DAILY_LOGIN', 'BIRTHDAY', 'ANNIVERSARY', 'SOCIAL_SHARE', 'GALLERY_INTERACTION', 'ADMIN', 'SYSTEM', 'REWARD', 'GIFT', 'SHOP', 'OTHER');

-- CreateEnum
CREATE TYPE "LoyaltyLevelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LoyaltyBadgeCategory" AS ENUM ('BOOKING', 'LOYALTY', 'SPENDING', 'REVIEW', 'REFERRAL', 'SOCIAL', 'CONTEST', 'SEASONAL', 'COLLECTION', 'COMMUNITY', 'VIP', 'SPECIAL');

-- CreateEnum
CREATE TYPE "LoyaltyAchievementCategory" AS ENUM ('BOOKING', 'ATTENDANCE', 'SPENDING', 'REVIEW', 'REFERRAL', 'SOCIAL', 'CONTEST', 'CHALLENGE', 'COLLECTION', 'SEASON_PASS', 'LOGIN_STREAK', 'SPECIAL');

-- CreateEnum
CREATE TYPE "LoyaltyProgressStatus" AS ENUM ('LOCKED', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "VipRewardType" AS ENUM ('FIXED_DISCOUNT', 'PERCENTAGE_DISCOUNT', 'FREE_SERVICE', 'FREE_NAIL_ART', 'FREE_PRODUCT', 'GIFT_CARD', 'LOYALTY_POINTS', 'EXPERIENCE_POINTS', 'CONTEST_ENTRY', 'SEASON_PASS_XP', 'PHYSICAL_GIFT', 'VIP_ACCESS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VipRewardStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClientRewardStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'USED', 'EXPIRED', 'CANCELLED', 'GIFTED');

-- CreateEnum
CREATE TYPE "ContestType" AS ENUM ('LOYALTY', 'SPENDING', 'REFERRAL', 'GOOGLE_REVIEW', 'WEBSITE_REVIEW', 'INSTAGRAM', 'SOCIAL_SHARE', 'EARLY_BOOKING', 'APPOINTMENT_STREAK', 'DAILY_CALENDAR', 'LUCKY_WHEEL', 'CUSTOM', 'BEST_NAILS', 'BEFORE_AFTER', 'VIP_CLIENT', 'SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'BIRTHDAY', 'VALENTINES_DAY', 'HALLOWEEN', 'CHRISTMAS', 'PRESTIGE', 'MYSTERY_PRIZE', 'NAIL_ART', 'SALON_SELFIE', 'AMBASSADOR', 'MOST_ACTIVE', 'LOYALTY_SPRINT', 'LOYALTY_MARATHON', 'GOLDEN_TICKET', 'WEDDING', 'GRADUATION', 'MOTHER_DAUGHTER', 'FRIENDS_DUO', 'COLOR_COLLECTION', 'FIRST_VISIT', 'COMEBACK', 'MYSTERY_CLIENT', 'TWELVE_MONTHS', 'PALACE_LEGEND', 'TEAM_CHALLENGE');

-- CreateEnum
CREATE TYPE "ContestScoringMode" AS ENUM ('POINTS', 'HIGHEST_SPEND', 'MOST_APPOINTMENTS', 'MOST_REFERRALS', 'MOST_REVIEWS', 'PUBLIC_VOTE', 'ADMIN_VOTE', 'RANDOM_DRAW', 'GOLDEN_TICKETS', 'COMPLETION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ContestEntryStatus" AS ENUM ('ACTIVE', 'DISQUALIFIED', 'WITHDRAWN', 'WINNER');

-- CreateEnum
CREATE TYPE "ContestPointSource" AS ENUM ('APPOINTMENT', 'PAYMENT', 'REVIEW', 'REFERRAL', 'SOCIAL', 'ADMIN', 'BONUS', 'VOTE', 'CHALLENGE', 'GOLDEN_TICKET', 'OTHER');

-- CreateEnum
CREATE TYPE "ChallengeFrequency" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChallengeMetric" AS ENUM ('APPOINTMENT_COUNT', 'COMPLETED_APPOINTMENT_COUNT', 'SPENDING_CENTS', 'REVIEW_COUNT', 'REFERRAL_COUNT', 'LOGIN_COUNT', 'LOGIN_STREAK', 'SOCIAL_SHARE_COUNT', 'GALLERY_LIKE_COUNT', 'CONTEST_ENTRY_COUNT', 'SERVICE_VARIETY_COUNT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VipSeasonStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VipSeasonTierType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'REGISTERED', 'QUALIFIED', 'REWARDED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VipTeamStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VipRuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VipRuleTrigger" AS ENUM ('USER_REGISTERED', 'DAILY_LOGIN', 'APPOINTMENT_CREATED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_COMPLETED', 'APPOINTMENT_CANCELLED', 'PAYMENT_COMPLETED', 'REVIEW_CREATED', 'REVIEW_APPROVED', 'REFERRAL_REGISTERED', 'REFERRAL_QUALIFIED', 'CONTEST_JOINED', 'CONTEST_WON', 'CHALLENGE_COMPLETED', 'LEVEL_REACHED', 'BADGE_UNLOCKED', 'ACHIEVEMENT_UNLOCKED', 'BIRTHDAY', 'MEMBERSHIP_ANNIVERSARY', 'INACTIVITY_REACHED', 'MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "VipRuleAction" AS ENUM ('ADD_XP', 'REMOVE_XP', 'ADD_POINTS', 'REMOVE_POINTS', 'GRANT_REWARD', 'GRANT_BADGE', 'COMPLETE_ACHIEVEMENT', 'ADD_CONTEST_POINTS', 'ADD_CONTEST_ENTRY', 'ADD_SEASON_XP', 'SEND_NOTIFICATION', 'CREATE_PROMOTION', 'ASSIGN_TEAM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MarketingRecommendationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MarketingRecommendationCategory" AS ENUM ('PLANNING', 'CLIENT_RETENTION', 'CLIENT_REACTIVATION', 'CONTEST', 'LOYALTY', 'REWARD', 'PROMOTION', 'SERVICE', 'REVENUE', 'CANCELLATION', 'NO_SHOW', 'SEASON_PASS', 'REFERRAL', 'COMMUNICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketingRecommendationStatus" AS ENUM ('NEW', 'VIEWED', 'ACCEPTED', 'APPLIED', 'DISMISSED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "VipEventType" AS ENUM ('DOUBLE_XP', 'TRIPLE_XP', 'BONUS_POINTS', 'HAPPY_HOUR', 'FLASH_CONTEST', 'WEEKEND_EVENT', 'BIRTHDAY', 'ANNIVERSARY', 'BLACK_FRIDAY', 'CHRISTMAS', 'HALLOWEEN', 'VALENTINES_DAY', 'SEASONAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VipEventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GiftTransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CollectionItemStatus" AS ENUM ('LOCKED', 'UNLOCKED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('TOP', 'HERO', 'CONTENT', 'BOTTOM', 'POPUP');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "allergies" TEXT,
    "internalNotes" TEXT,
    "marketingEmail" BOOLEAN NOT NULL DEFAULT false,
    "marketingSms" BOOLEAN NOT NULL DEFAULT false,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "promotionalPriceCents" INTEGER,
    "durationMinutes" INTEGER NOT NULL,
    "cleanupMinutes" INTEGER NOT NULL DEFAULT 0,
    "depositRequired" BOOLEAN NOT NULL DEFAULT false,
    "depositCents" INTEGER,
    "imageUrl" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceImage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "color" TEXT,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptsOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "defaultCleanupMinutes" INTEGER NOT NULL DEFAULT 0,
    "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffService" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "durationMinutes" INTEGER,
    "cleanupMinutes" INTEGER,
    "priceCents" INTEGER,
    "depositRequired" BOOLEAN,
    "depositCents" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workstation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableForBooking" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workstation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffWorkstation" (
    "staffId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffWorkstation_pkey" PRIMARY KEY ("staffId","workstationId")
);

-- CreateTable
CREATE TABLE "WorkstationService" (
    "workstationId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkstationService_pkey" PRIMARY KEY ("workstationId","serviceId")
);

-- CreateTable
CREATE TABLE "StaffWorkingHour" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "hasBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffWorkingHourOverride" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "hasBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffWorkingHourOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTimeOff" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHour" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHourOverride" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "reason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHourOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOff" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "staffId" TEXT,
    "workstationId" TEXT,
    "processedById" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "totalDurationMinutes" INTEGER NOT NULL,
    "totalPriceCents" INTEGER NOT NULL,
    "depositCents" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "paymentMethod" "PaymentMethod",
    "clientComment" TEXT,
    "adminComment" TEXT,
    "cancellationReason" TEXT,
    "paypalOrderId" TEXT,
    "paypalCaptureId" TEXT,
    "paypalPayerId" TEXT,
    "paidAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "refusedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "reviewRequestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentHistory" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "previousStatus" "AppointmentStatus",
    "nextStatus" "AppointmentStatus",
    "previousStartsAt" TIMESTAMP(3),
    "nextStartsAt" TIMESTAMP(3),
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentService" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "comment" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppointmentService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentImage" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT NOT NULL,
    "alt" TEXT,
    "serviceName" TEXT,
    "priceCents" INTEGER,
    "durationMinutes" INTEGER,
    "tags" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryMedia" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorId" TEXT,
    "appointmentId" TEXT,
    "responderId" TEXT,
    "source" "ReviewSource" NOT NULL DEFAULT 'WEBSITE',
    "sourceId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "response" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "appointmentId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "percentageValue" INTEGER,
    "amountCents" INTEGER,
    "code" TEXT,
    "imageUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perClientLimit" INTEGER,
    "minimumSpendCents" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionService" (
    "promotionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "PromotionService_pkey" PRIMARY KEY ("promotionId","serviceId")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "buttonLabel" TEXT,
    "buttonUrl" TEXT,
    "position" "BannerPosition" NOT NULL DEFAULT 'TOP',
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "programStatus" "VipProgramStatus" NOT NULL DEFAULT 'DISABLED',
    "clubEnabled" BOOLEAN NOT NULL DEFAULT false,
    "showPreLaunchPage" BOOLEAN NOT NULL DEFAULT false,
    "showInPublicMenu" BOOLEAN NOT NULL DEFAULT false,
    "showInClientMenu" BOOLEAN NOT NULL DEFAULT false,
    "allowNewRegistrations" BOOLEAN NOT NULL DEFAULT false,
    "xpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "levelsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "badgesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "achievementsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rewardsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "contestsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "challengesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "referralsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "teamsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "collectionsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "seasonPassEnabled" BOOLEAN NOT NULL DEFAULT false,
    "vipShopEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyWheelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "giftChestsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "giftingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "publicLeaderboardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "leaderboardVisibility" "VipVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "anonymizeLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardSize" INTEGER NOT NULL DEFAULT 20,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnXpEarned" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnLevelUp" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnBadgeUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnAchievement" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnRewardUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnContestUpdate" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnRankingChange" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnSeasonProgress" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnReferralQualified" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnRewardExpiration" BOOLEAN NOT NULL DEFAULT false,
    "assistantEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantMode" "VipAssistantMode" NOT NULL DEFAULT 'DISABLED',
    "assistantPlanningAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantRetentionAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantContestAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantRevenueAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantCancellationAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantReferralAnalysisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automaticRulesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automaticBirthdayRewardsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automaticAnniversaryRewardsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automaticInactiveClientRules" BOOLEAN NOT NULL DEFAULT false,
    "automaticSeasonActivationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automaticContestActivationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "baseXpMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "basePointsMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "pointsExpirationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pointsExpirationMonths" INTEGER,
    "xpExpirationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "xpExpirationMonths" INTEGER,
    "rewardsExpirationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultRewardValidityDays" INTEGER,
    "clubName" TEXT NOT NULL DEFAULT 'Club VIP Le Palais des Ongles',
    "pointsLabel" TEXT NOT NULL DEFAULT 'Points',
    "xpLabel" TEXT NOT NULL DEFAULT 'XP',
    "logoUrl" TEXT,
    "iconUrl" TEXT,
    "bannerUrl" TEXT,
    "backgroundUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "preLaunchTitle" TEXT,
    "preLaunchDescription" TEXT,
    "preLaunchImageUrl" TEXT,
    "preLaunchButtonLabel" TEXT,
    "preLaunchButtonUrl" TEXT,
    "publicTitle" TEXT,
    "publicDescription" TEXT,
    "publicImageUrl" TEXT,
    "termsUrl" TEXT,
    "privacyMessage" TEXT,
    "legalNotice" TEXT,
    "minimumAge" INTEGER,
    "launchedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT,
    "prize" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "drawAt" TIMESTAMP(3),
    "winnerId" TEXT,
    "maximumEntries" INTEGER,
    "requiresAccount" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestParticipant" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberNumber" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "qrCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalExperienceEarned" INTEGER NOT NULL DEFAULT 0,
    "experienceSpent" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "totalPointsSpent" INTEGER NOT NULL DEFAULT 0,
    "currentLevelId" TEXT,
    "levelReachedAt" TIMESTAMP(3),
    "completedAppointments" INTEGER NOT NULL DEFAULT 0,
    "cancelledAppointments" INTEGER NOT NULL DEFAULT 0,
    "noShowAppointments" INTEGER NOT NULL DEFAULT 0,
    "totalSpentCents" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalContestEntries" INTEGER NOT NULL DEFAULT 0,
    "totalContestWins" INTEGER NOT NULL DEFAULT 0,
    "totalBadges" INTEGER NOT NULL DEFAULT 0,
    "totalAchievements" INTEGER NOT NULL DEFAULT 0,
    "totalRewardsUnlocked" INTEGER NOT NULL DEFAULT 0,
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "longestLoginStreak" INTEGER NOT NULL DEFAULT 0,
    "lastExperienceEarnedAt" TIMESTAMP(3),
    "lastAppointmentAt" TIMESTAMP(3),
    "lastRewardClaimedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "LoyaltyTransactionType" NOT NULL,
    "source" "LoyaltyTransactionSource" NOT NULL,
    "xpAmount" INTEGER NOT NULL DEFAULT 0,
    "pointsAmount" INTEGER NOT NULL DEFAULT 0,
    "xpBalanceAfter" INTEGER NOT NULL,
    "pointsBalanceAfter" INTEGER NOT NULL,
    "baseXpAmount" INTEGER,
    "basePointsAmount" INTEGER,
    "xpMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "pointsMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "appointmentReference" TEXT,
    "contestReference" TEXT,
    "rewardReference" TEXT,
    "challengeReference" TEXT,
    "idempotencyKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "reversalOfId" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "level" INTEGER NOT NULL,
    "requiredXp" INTEGER NOT NULL,
    "requiredPoints" INTEGER NOT NULL DEFAULT 0,
    "xpMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "pointsMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "referralMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "priorityBooking" BOOLEAN NOT NULL DEFAULT false,
    "vipSupport" BOOLEAN NOT NULL DEFAULT false,
    "exclusiveContests" BOOLEAN NOT NULL DEFAULT false,
    "exclusiveRewards" BOOLEAN NOT NULL DEFAULT false,
    "exclusiveEvents" BOOLEAN NOT NULL DEFAULT false,
    "freeGift" BOOLEAN NOT NULL DEFAULT false,
    "birthdayGift" BOOLEAN NOT NULL DEFAULT false,
    "permanentDiscountPercent" INTEGER,
    "status" "LoyaltyLevelStatus" NOT NULL DEFAULT 'ACTIVE',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT,
    "referredEmail" TEXT,
    "referredFirstName" TEXT,
    "referredLastName" TEXT,
    "referredPhone" TEXT,
    "referralCode" TEXT NOT NULL,
    "invitationToken" TEXT,
    "invitationUrl" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "qualificationReason" TEXT,
    "qualifyingAppointmentId" TEXT,
    "qualifyingPaymentCents" INTEGER,
    "referrerXpReward" INTEGER NOT NULL DEFAULT 0,
    "referrerPointsReward" INTEGER NOT NULL DEFAULT 0,
    "referrerRewardId" TEXT,
    "referrerRewardGranted" BOOLEAN NOT NULL DEFAULT false,
    "referrerRewardGrantedAt" TIMESTAMP(3),
    "referredXpReward" INTEGER NOT NULL DEFAULT 0,
    "referredPointsReward" INTEGER NOT NULL DEFAULT 0,
    "referredRewardId" TEXT,
    "referredRewardGranted" BOOLEAN NOT NULL DEFAULT false,
    "referredRewardGrantedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt" TIMESTAMP(3),
    "qualifiedAt" TIMESTAMP(3),
    "rewardedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLevelHistory" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "previousLevelId" TEXT,
    "newLevelId" TEXT NOT NULL,
    "experienceAtUpgrade" INTEGER NOT NULL,
    "pointsAtUpgrade" INTEGER NOT NULL,
    "upgradedAutomatically" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientLevelHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyBadge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "category" "LoyaltyBadgeCategory" NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "lockedImageUrl" TEXT,
    "color" TEXT,
    "backgroundColor" TEXT,
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "conditionType" TEXT,
    "conditionConfig" JSONB,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "rewardId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "maximumUnlocks" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibleInProfile" BOOLEAN NOT NULL DEFAULT true,
    "visibleInGallery" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "status" "LoyaltyProgressStatus" NOT NULL DEFAULT 'LOCKED',
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "unlockCount" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "lastProgressAt" TIMESTAMP(3),
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "rewardGranted" BOOLEAN NOT NULL DEFAULT false,
    "rewardGrantedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyAchievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "category" "LoyaltyAchievementCategory" NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "lockedImageUrl" TEXT,
    "bannerUrl" TEXT,
    "color" TEXT,
    "backgroundColor" TEXT,
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "metric" TEXT,
    "conditionConfig" JSONB,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT,
    "hiddenUntilUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "rewardId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "maximumCompletions" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibleInProfile" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "status" "LoyaltyProgressStatus" NOT NULL DEFAULT 'LOCKED',
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "lastProgressAt" TIMESTAMP(3),
    "rewardGranted" BOOLEAN NOT NULL DEFAULT false,
    "rewardGrantedAt" TIMESTAMP(3),
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipReward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "type" "VipRewardType" NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "color" TEXT,
    "fixedAmountCents" INTEGER,
    "percentage" INTEGER,
    "loyaltyPoints" INTEGER,
    "experiencePoints" INTEGER,
    "freeServiceId" TEXT,
    "quantity" INTEGER,
    "minimumLevelId" TEXT,
    "minimumPoints" INTEGER,
    "minimumXp" INTEGER,
    "rewardCode" TEXT,
    "couponCodePrefix" TEXT,
    "validForDays" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "unlimitedStock" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "remainingStock" INTEGER,
    "status" "VipRewardStatus" NOT NULL DEFAULT 'ACTIVE',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "repeatable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "status" "ClientRewardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "uniqueCode" TEXT NOT NULL,
    "qrCode" TEXT,
    "barcode" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "giftedAt" TIMESTAMP(3),
    "reservedAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "transactionId" TEXT,
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardUsage" (
    "id" TEXT NOT NULL,
    "clientRewardId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "usedById" TEXT,
    "validatedById" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipShopItem" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pointsPrice" INTEGER NOT NULL,
    "xpPrice" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "unlimitedStock" BOOLEAN NOT NULL DEFAULT true,
    "maximumPerClient" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipShopPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "xpSpent" INTEGER,
    "clientRewardId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VipShopPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipGiftTransfer" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "clientRewardId" TEXT,
    "message" TEXT,
    "status" "GiftTransferStatus" NOT NULL DEFAULT 'PENDING',
    "transferCode" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "refusedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "VipGiftTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "category" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityReference" TEXT,
    "previousData" JSONB,
    "nextData" JSONB,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "route" TEXT,
    "method" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VipAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestPointEntry" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "ContestPointSource" NOT NULL DEFAULT 'OTHER',
    "points" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestPointEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestVote" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateUserId" TEXT,
    "candidateEntryId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 1,
    "comment" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestWinner" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER,
    "points" INTEGER,
    "prizeName" TEXT,
    "prizeDescription" TEXT,
    "prizeValueCents" INTEGER,
    "rewardId" TEXT,
    "announcedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestWinner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "status" "LoyaltyProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "rewardId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "lastProgressAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSeasonPass" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "tierType" "VipSeasonTierType" NOT NULL DEFAULT 'FREE',
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumPurchasedAt" TIMESTAMP(3),
    "premiumPriceCents" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastProgressAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSeasonPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VipTeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "contributionPoints" INTEGER NOT NULL DEFAULT 0,
    "contributionXp" INTEGER NOT NULL DEFAULT 0,
    "contestPoints" INTEGER NOT NULL DEFAULT 0,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipAutomationRule" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "VipRuleStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger" "VipRuleTrigger" NOT NULL,
    "action" "VipRuleAction" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB,
    "actionConfiguration" JSONB,
    "xpAmount" INTEGER,
    "pointsAmount" INTEGER,
    "rewardId" TEXT,
    "maximumExecutions" INTEGER,
    "maximumExecutionsPerUser" INTEGER,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "lastExecutedAt" TIMESTAMP(3),
    "nextExecutionAt" TIMESTAMP(3),
    "isSystemRule" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipAutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipEvent" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "VipEventType" NOT NULL,
    "status" "VipEventStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "bannerUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "xpMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "pointsMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    "bonusXp" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "rewardId" TEXT,
    "visibility" "VipVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingRecommendation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MarketingRecommendationCategory" NOT NULL,
    "priority" "MarketingRecommendationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MarketingRecommendationStatus" NOT NULL DEFAULT 'NEW',
    "reason" TEXT,
    "expectedImpact" TEXT,
    "expectedRevenueCents" INTEGER,
    "confidenceScore" INTEGER,
    "recommendedAction" JSONB,
    "analysisData" JSONB,
    "targetEntityType" TEXT,
    "targetEntityId" TEXT,
    "appliedById" TEXT,
    "dismissedById" TEXT,
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "dismissalReason" TEXT,
    "failureReason" TEXT,
    "resultData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE INDEX "ServiceCategory_isActive_sortOrder_idx" ON "ServiceCategory"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");

-- CreateIndex
CREATE INDEX "Service_isActive_sortOrder_idx" ON "Service"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Service_isFeatured_idx" ON "Service"("isFeatured");

-- CreateIndex
CREATE INDEX "ServiceImage_serviceId_sortOrder_idx" ON "ServiceImage"("serviceId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE INDEX "StaffProfile_isActive_acceptsOnlineBooking_sortOrder_idx" ON "StaffProfile"("isActive", "acceptsOnlineBooking", "sortOrder");

-- CreateIndex
CREATE INDEX "StaffProfile_isOwner_idx" ON "StaffProfile"("isOwner");

-- CreateIndex
CREATE INDEX "StaffService_serviceId_isActive_idx" ON "StaffService"("serviceId", "isActive");

-- CreateIndex
CREATE INDEX "StaffService_staffId_isActive_sortOrder_idx" ON "StaffService"("staffId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StaffService_staffId_serviceId_key" ON "StaffService"("staffId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Workstation_slug_key" ON "Workstation"("slug");

-- CreateIndex
CREATE INDEX "Workstation_isActive_availableForBooking_sortOrder_idx" ON "Workstation"("isActive", "availableForBooking", "sortOrder");

-- CreateIndex
CREATE INDEX "StaffWorkstation_workstationId_isActive_idx" ON "StaffWorkstation"("workstationId", "isActive");

-- CreateIndex
CREATE INDEX "StaffWorkstation_staffId_isPrimary_isActive_idx" ON "StaffWorkstation"("staffId", "isPrimary", "isActive");

-- CreateIndex
CREATE INDEX "WorkstationService_serviceId_isActive_idx" ON "WorkstationService"("serviceId", "isActive");

-- CreateIndex
CREATE INDEX "WorkstationService_workstationId_isActive_idx" ON "WorkstationService"("workstationId", "isActive");

-- CreateIndex
CREATE INDEX "StaffWorkingHour_staffId_isOpen_idx" ON "StaffWorkingHour"("staffId", "isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "StaffWorkingHour_staffId_dayOfWeek_key" ON "StaffWorkingHour"("staffId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "StaffWorkingHourOverride_date_idx" ON "StaffWorkingHourOverride"("date");

-- CreateIndex
CREATE INDEX "StaffWorkingHourOverride_staffId_date_idx" ON "StaffWorkingHourOverride"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffWorkingHourOverride_staffId_date_key" ON "StaffWorkingHourOverride"("staffId", "date");

-- CreateIndex
CREATE INDEX "StaffTimeOff_staffId_startsAt_endsAt_idx" ON "StaffTimeOff"("staffId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "StaffTimeOff_startsAt_endsAt_idx" ON "StaffTimeOff"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dayOfWeek_key" ON "WorkingHour"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkingHourOverride_date_idx" ON "WorkingHourOverride"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHourOverride_date_key" ON "WorkingHourOverride"("date");

-- CreateIndex
CREATE INDEX "TimeOff_startsAt_endsAt_idx" ON "TimeOff"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_paypalOrderId_key" ON "Appointment"("paypalOrderId");

-- CreateIndex
CREATE INDEX "Appointment_clientId_startsAt_idx" ON "Appointment"("clientId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_staffId_startsAt_endsAt_idx" ON "Appointment"("staffId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Appointment_workstationId_startsAt_endsAt_idx" ON "Appointment"("workstationId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Appointment_workstationId_status_startsAt_idx" ON "Appointment"("workstationId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_staffId_status_startsAt_idx" ON "Appointment"("staffId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_status_startsAt_idx" ON "Appointment"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_startsAt_endsAt_idx" ON "Appointment"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Appointment_createdAt_idx" ON "Appointment"("createdAt");

-- CreateIndex
CREATE INDEX "AppointmentHistory_appointmentId_createdAt_idx" ON "AppointmentHistory"("appointmentId", "createdAt");

-- CreateIndex
CREATE INDEX "AppointmentHistory_actorId_createdAt_idx" ON "AppointmentHistory"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AppointmentHistory_action_createdAt_idx" ON "AppointmentHistory"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AppointmentService_appointmentId_idx" ON "AppointmentService"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentService_serviceId_idx" ON "AppointmentService"("serviceId");

-- CreateIndex
CREATE INDEX "AppointmentImage_appointmentId_idx" ON "AppointmentImage"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryCategory_slug_key" ON "GalleryCategory"("slug");

-- CreateIndex
CREATE INDEX "GalleryCategory_isActive_sortOrder_idx" ON "GalleryCategory"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_slug_key" ON "GalleryItem"("slug");

-- CreateIndex
CREATE INDEX "GalleryItem_categoryId_idx" ON "GalleryItem"("categoryId");

-- CreateIndex
CREATE INDEX "GalleryItem_isPublished_publishedAt_idx" ON "GalleryItem"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "GalleryItem_isFeatured_sortOrder_idx" ON "GalleryItem"("isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "GalleryMedia_galleryItemId_sortOrder_idx" ON "GalleryMedia"("galleryItemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Review_appointmentId_key" ON "Review"("appointmentId");

-- CreateIndex
CREATE INDEX "Review_status_publishedAt_idx" ON "Review"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Review_source_sourceId_idx" ON "Review"("source", "sourceId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_isFeatured_idx" ON "Review"("isFeatured");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_isClosed_idx" ON "Conversation"("isClosed");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_slug_key" ON "Promotion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- CreateIndex
CREATE INDEX "Promotion_isActive_startsAt_endsAt_idx" ON "Promotion"("isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Promotion_showOnHomepage_idx" ON "Promotion"("showOnHomepage");

-- CreateIndex
CREATE INDEX "Banner_isActive_position_sortOrder_idx" ON "Banner"("isActive", "position", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VipConfiguration_key_key" ON "VipConfiguration"("key");

-- CreateIndex
CREATE INDEX "VipConfiguration_programStatus_idx" ON "VipConfiguration"("programStatus");

-- CreateIndex
CREATE INDEX "VipConfiguration_clubEnabled_idx" ON "VipConfiguration"("clubEnabled");

-- CreateIndex
CREATE INDEX "VipConfiguration_assistantEnabled_idx" ON "VipConfiguration"("assistantEnabled");

-- CreateIndex
CREATE INDEX "VipConfiguration_createdById_idx" ON "VipConfiguration"("createdById");

-- CreateIndex
CREATE INDEX "VipConfiguration_updatedById_idx" ON "VipConfiguration"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_slug_key" ON "Contest"("slug");

-- CreateIndex
CREATE INDEX "Contest_status_startsAt_endsAt_idx" ON "Contest"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Contest_showOnHomepage_idx" ON "Contest"("showOnHomepage");

-- CreateIndex
CREATE INDEX "ContestParticipant_userId_idx" ON "ContestParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestParticipant_contestId_userId_key" ON "ContestParticipant"("contestId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_isPublic_idx" ON "Setting"("isPublic");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyAccount_userId_key" ON "LoyaltyAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyAccount_memberNumber_key" ON "LoyaltyAccount"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyAccount_referralCode_key" ON "LoyaltyAccount"("referralCode");

-- CreateIndex
CREATE INDEX "LoyaltyAccount_experience_idx" ON "LoyaltyAccount"("experience");

-- CreateIndex
CREATE INDEX "LoyaltyAccount_points_idx" ON "LoyaltyAccount"("points");

-- CreateIndex
CREATE INDEX "LoyaltyAccount_currentLevelId_idx" ON "LoyaltyAccount"("currentLevelId");

-- CreateIndex
CREATE INDEX "LoyaltyAccount_isActive_idx" ON "LoyaltyAccount"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyTransaction_idempotencyKey_key" ON "LoyaltyTransaction"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyTransaction_reversalOfId_key" ON "LoyaltyTransaction"("reversalOfId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_userId_createdAt_idx" ON "LoyaltyTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_accountId_createdAt_idx" ON "LoyaltyTransaction"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_type_createdAt_idx" ON "LoyaltyTransaction"("type", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_source_createdAt_idx" ON "LoyaltyTransaction"("source", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_sourceEntityType_sourceEntityId_idx" ON "LoyaltyTransaction"("sourceEntityType", "sourceEntityId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_expiresAt_idx" ON "LoyaltyTransaction"("expiresAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_isReversed_idx" ON "LoyaltyTransaction"("isReversed");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyLevel_slug_key" ON "LoyaltyLevel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyLevel_level_key" ON "LoyaltyLevel"("level");

-- CreateIndex
CREATE INDEX "LoyaltyLevel_status_idx" ON "LoyaltyLevel"("status");

-- CreateIndex
CREATE INDEX "LoyaltyLevel_visible_idx" ON "LoyaltyLevel"("visible");

-- CreateIndex
CREATE INDEX "LoyaltyLevel_sortOrder_idx" ON "LoyaltyLevel"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_invitationToken_key" ON "Referral"("invitationToken");

-- CreateIndex
CREATE INDEX "Referral_referrerId_status_idx" ON "Referral"("referrerId", "status");

-- CreateIndex
CREATE INDEX "Referral_referredUserId_idx" ON "Referral"("referredUserId");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referredEmail_idx" ON "Referral"("referredEmail");

-- CreateIndex
CREATE INDEX "Referral_status_createdAt_idx" ON "Referral"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Referral_expiresAt_idx" ON "Referral"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerId_referredEmail_key" ON "Referral"("referrerId", "referredEmail");

-- CreateIndex
CREATE INDEX "ClientLevelHistory_accountId_idx" ON "ClientLevelHistory"("accountId");

-- CreateIndex
CREATE INDEX "ClientLevelHistory_newLevelId_idx" ON "ClientLevelHistory"("newLevelId");

-- CreateIndex
CREATE INDEX "ClientLevelHistory_createdAt_idx" ON "ClientLevelHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyBadge_slug_key" ON "LoyaltyBadge"("slug");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_category_idx" ON "LoyaltyBadge"("category");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_isActive_idx" ON "LoyaltyBadge"("isActive");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_isSecret_idx" ON "LoyaltyBadge"("isSecret");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_startsAt_endsAt_idx" ON "LoyaltyBadge"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_sortOrder_idx" ON "LoyaltyBadge"("sortOrder");

-- CreateIndex
CREATE INDEX "LoyaltyBadge_rewardId_idx" ON "LoyaltyBadge"("rewardId");

-- CreateIndex
CREATE INDEX "ClientBadge_userId_idx" ON "ClientBadge"("userId");

-- CreateIndex
CREATE INDEX "ClientBadge_accountId_idx" ON "ClientBadge"("accountId");

-- CreateIndex
CREATE INDEX "ClientBadge_badgeId_idx" ON "ClientBadge"("badgeId");

-- CreateIndex
CREATE INDEX "ClientBadge_status_idx" ON "ClientBadge"("status");

-- CreateIndex
CREATE INDEX "ClientBadge_unlockedAt_idx" ON "ClientBadge"("unlockedAt");

-- CreateIndex
CREATE INDEX "ClientBadge_isFeatured_idx" ON "ClientBadge"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "ClientBadge_accountId_badgeId_key" ON "ClientBadge"("accountId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyAchievement_slug_key" ON "LoyaltyAchievement"("slug");

-- CreateIndex
CREATE INDEX "LoyaltyAchievement_category_idx" ON "LoyaltyAchievement"("category");

-- CreateIndex
CREATE INDEX "LoyaltyAchievement_isActive_idx" ON "LoyaltyAchievement"("isActive");

-- CreateIndex
CREATE INDEX "LoyaltyAchievement_startsAt_endsAt_idx" ON "LoyaltyAchievement"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "LoyaltyAchievement_sortOrder_idx" ON "LoyaltyAchievement"("sortOrder");

-- CreateIndex
CREATE INDEX "LoyaltyAchievement_rewardId_idx" ON "LoyaltyAchievement"("rewardId");

-- CreateIndex
CREATE INDEX "ClientAchievement_userId_idx" ON "ClientAchievement"("userId");

-- CreateIndex
CREATE INDEX "ClientAchievement_accountId_idx" ON "ClientAchievement"("accountId");

-- CreateIndex
CREATE INDEX "ClientAchievement_achievementId_idx" ON "ClientAchievement"("achievementId");

-- CreateIndex
CREATE INDEX "ClientAchievement_status_idx" ON "ClientAchievement"("status");

-- CreateIndex
CREATE INDEX "ClientAchievement_completedAt_idx" ON "ClientAchievement"("completedAt");

-- CreateIndex
CREATE INDEX "ClientAchievement_isFeatured_idx" ON "ClientAchievement"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAchievement_accountId_achievementId_key" ON "ClientAchievement"("accountId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "VipReward_slug_key" ON "VipReward"("slug");

-- CreateIndex
CREATE INDEX "VipReward_status_idx" ON "VipReward"("status");

-- CreateIndex
CREATE INDEX "VipReward_featured_idx" ON "VipReward"("featured");

-- CreateIndex
CREATE INDEX "VipReward_visible_idx" ON "VipReward"("visible");

-- CreateIndex
CREATE INDEX "VipReward_type_idx" ON "VipReward"("type");

-- CreateIndex
CREATE INDEX "VipReward_startsAt_endsAt_idx" ON "VipReward"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "VipReward_sortOrder_idx" ON "VipReward"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ClientReward_uniqueCode_key" ON "ClientReward"("uniqueCode");

-- CreateIndex
CREATE INDEX "ClientReward_userId_idx" ON "ClientReward"("userId");

-- CreateIndex
CREATE INDEX "ClientReward_accountId_idx" ON "ClientReward"("accountId");

-- CreateIndex
CREATE INDEX "ClientReward_rewardId_idx" ON "ClientReward"("rewardId");

-- CreateIndex
CREATE INDEX "ClientReward_status_idx" ON "ClientReward"("status");

-- CreateIndex
CREATE INDEX "ClientReward_expiresAt_idx" ON "ClientReward"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardUsage_clientRewardId_key" ON "RewardUsage"("clientRewardId");

-- CreateIndex
CREATE INDEX "RewardUsage_appointmentId_idx" ON "RewardUsage"("appointmentId");

-- CreateIndex
CREATE INDEX "RewardUsage_usedById_idx" ON "RewardUsage"("usedById");

-- CreateIndex
CREATE INDEX "RewardUsage_validatedById_idx" ON "RewardUsage"("validatedById");

-- CreateIndex
CREATE UNIQUE INDEX "VipShopItem_rewardId_key" ON "VipShopItem"("rewardId");

-- CreateIndex
CREATE INDEX "VipShopItem_featured_idx" ON "VipShopItem"("featured");

-- CreateIndex
CREATE INDEX "VipShopItem_visible_idx" ON "VipShopItem"("visible");

-- CreateIndex
CREATE INDEX "VipShopItem_sortOrder_idx" ON "VipShopItem"("sortOrder");

-- CreateIndex
CREATE INDEX "VipShopPurchase_userId_idx" ON "VipShopPurchase"("userId");

-- CreateIndex
CREATE INDEX "VipShopPurchase_accountId_idx" ON "VipShopPurchase"("accountId");

-- CreateIndex
CREATE INDEX "VipShopPurchase_rewardId_idx" ON "VipShopPurchase"("rewardId");

-- CreateIndex
CREATE INDEX "VipShopPurchase_createdAt_idx" ON "VipShopPurchase"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VipGiftTransfer_clientRewardId_key" ON "VipGiftTransfer"("clientRewardId");

-- CreateIndex
CREATE UNIQUE INDEX "VipGiftTransfer_transferCode_key" ON "VipGiftTransfer"("transferCode");

-- CreateIndex
CREATE INDEX "VipGiftTransfer_senderId_idx" ON "VipGiftTransfer"("senderId");

-- CreateIndex
CREATE INDEX "VipGiftTransfer_recipientId_idx" ON "VipGiftTransfer"("recipientId");

-- CreateIndex
CREATE INDEX "VipGiftTransfer_status_idx" ON "VipGiftTransfer"("status");

-- CreateIndex
CREATE INDEX "VipGiftTransfer_createdAt_idx" ON "VipGiftTransfer"("createdAt");

-- CreateIndex
CREATE INDEX "VipAuditLog_actorId_createdAt_idx" ON "VipAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "VipAuditLog_action_createdAt_idx" ON "VipAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "VipAuditLog_category_createdAt_idx" ON "VipAuditLog"("category", "createdAt");

-- CreateIndex
CREATE INDEX "VipAuditLog_entityType_entityId_idx" ON "VipAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "VipAuditLog_success_createdAt_idx" ON "VipAuditLog"("success", "createdAt");

-- CreateIndex
CREATE INDEX "VipAuditLog_requestId_idx" ON "VipAuditLog"("requestId");

-- CreateIndex
CREATE INDEX "VipAuditLog_createdAt_idx" ON "VipAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContestPointEntry_idempotencyKey_key" ON "ContestPointEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ContestPointEntry_contestId_createdAt_idx" ON "ContestPointEntry"("contestId", "createdAt");

-- CreateIndex
CREATE INDEX "ContestPointEntry_userId_createdAt_idx" ON "ContestPointEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ContestPointEntry_contestId_userId_idx" ON "ContestPointEntry"("contestId", "userId");

-- CreateIndex
CREATE INDEX "ContestPointEntry_source_idx" ON "ContestPointEntry"("source");

-- CreateIndex
CREATE INDEX "ContestPointEntry_sourceEntityType_sourceEntityId_idx" ON "ContestPointEntry"("sourceEntityType", "sourceEntityId");

-- CreateIndex
CREATE INDEX "ContestVote_contestId_createdAt_idx" ON "ContestVote"("contestId", "createdAt");

-- CreateIndex
CREATE INDEX "ContestVote_userId_createdAt_idx" ON "ContestVote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ContestVote_candidateUserId_idx" ON "ContestVote"("candidateUserId");

-- CreateIndex
CREATE INDEX "ContestVote_candidateEntryId_idx" ON "ContestVote"("candidateEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestVote_contestId_userId_key" ON "ContestVote"("contestId", "userId");

-- CreateIndex
CREATE INDEX "ContestWinner_contestId_idx" ON "ContestWinner"("contestId");

-- CreateIndex
CREATE INDEX "ContestWinner_userId_idx" ON "ContestWinner"("userId");

-- CreateIndex
CREATE INDEX "ContestWinner_rewardId_idx" ON "ContestWinner"("rewardId");

-- CreateIndex
CREATE INDEX "ContestWinner_claimedAt_idx" ON "ContestWinner"("claimedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContestWinner_contestId_position_key" ON "ContestWinner"("contestId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ContestWinner_contestId_userId_key" ON "ContestWinner"("contestId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientChallenge_idempotencyKey_key" ON "ClientChallenge"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ClientChallenge_userId_status_idx" ON "ClientChallenge"("userId", "status");

-- CreateIndex
CREATE INDEX "ClientChallenge_accountId_status_idx" ON "ClientChallenge"("accountId", "status");

-- CreateIndex
CREATE INDEX "ClientChallenge_challengeId_idx" ON "ClientChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "ClientChallenge_rewardId_idx" ON "ClientChallenge"("rewardId");

-- CreateIndex
CREATE INDEX "ClientChallenge_expiresAt_idx" ON "ClientChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "ClientChallenge_completedAt_idx" ON "ClientChallenge"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientChallenge_userId_challengeId_key" ON "ClientChallenge"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_userId_idx" ON "ClientSeasonPass"("userId");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_accountId_idx" ON "ClientSeasonPass"("accountId");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_seasonId_idx" ON "ClientSeasonPass"("seasonId");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_tierType_idx" ON "ClientSeasonPass"("tierType");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_isPremium_idx" ON "ClientSeasonPass"("isPremium");

-- CreateIndex
CREATE INDEX "ClientSeasonPass_expiresAt_idx" ON "ClientSeasonPass"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSeasonPass_userId_seasonId_key" ON "ClientSeasonPass"("userId", "seasonId");

-- CreateIndex
CREATE INDEX "VipTeamMember_teamId_status_idx" ON "VipTeamMember"("teamId", "status");

-- CreateIndex
CREATE INDEX "VipTeamMember_userId_status_idx" ON "VipTeamMember"("userId", "status");

-- CreateIndex
CREATE INDEX "VipTeamMember_isCaptain_idx" ON "VipTeamMember"("isCaptain");

-- CreateIndex
CREATE INDEX "VipTeamMember_joinedAt_idx" ON "VipTeamMember"("joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VipTeamMember_teamId_userId_key" ON "VipTeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VipAutomationRule_slug_key" ON "VipAutomationRule"("slug");

-- CreateIndex
CREATE INDEX "VipAutomationRule_status_priority_idx" ON "VipAutomationRule"("status", "priority");

-- CreateIndex
CREATE INDEX "VipAutomationRule_trigger_status_idx" ON "VipAutomationRule"("trigger", "status");

-- CreateIndex
CREATE INDEX "VipAutomationRule_action_idx" ON "VipAutomationRule"("action");

-- CreateIndex
CREATE INDEX "VipAutomationRule_createdById_idx" ON "VipAutomationRule"("createdById");

-- CreateIndex
CREATE INDEX "VipAutomationRule_rewardId_idx" ON "VipAutomationRule"("rewardId");

-- CreateIndex
CREATE INDEX "VipAutomationRule_startsAt_endsAt_idx" ON "VipAutomationRule"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "VipAutomationRule_nextExecutionAt_idx" ON "VipAutomationRule"("nextExecutionAt");

-- CreateIndex
CREATE UNIQUE INDEX "VipEvent_slug_key" ON "VipEvent"("slug");

-- CreateIndex
CREATE INDEX "VipEvent_status_startsAt_endsAt_idx" ON "VipEvent"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "VipEvent_type_status_idx" ON "VipEvent"("type", "status");

-- CreateIndex
CREATE INDEX "VipEvent_createdById_idx" ON "VipEvent"("createdById");

-- CreateIndex
CREATE INDEX "VipEvent_rewardId_idx" ON "VipEvent"("rewardId");

-- CreateIndex
CREATE INDEX "VipEvent_showOnHomepage_idx" ON "VipEvent"("showOnHomepage");

-- CreateIndex
CREATE INDEX "VipEvent_visibility_idx" ON "VipEvent"("visibility");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_status_priority_idx" ON "MarketingRecommendation"("status", "priority");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_category_status_idx" ON "MarketingRecommendation"("category", "status");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_appliedById_idx" ON "MarketingRecommendation"("appliedById");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_dismissedById_idx" ON "MarketingRecommendation"("dismissedById");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_targetEntityType_targetEntityId_idx" ON "MarketingRecommendation"("targetEntityType", "targetEntityId");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_expiresAt_idx" ON "MarketingRecommendation"("expiresAt");

-- CreateIndex
CREATE INDEX "MarketingRecommendation_createdAt_idx" ON "MarketingRecommendation"("createdAt");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceImage" ADD CONSTRAINT "ServiceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffWorkstation" ADD CONSTRAINT "StaffWorkstation_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffWorkstation" ADD CONSTRAINT "StaffWorkstation_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkstationService" ADD CONSTRAINT "WorkstationService_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkstationService" ADD CONSTRAINT "WorkstationService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffWorkingHour" ADD CONSTRAINT "StaffWorkingHour_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffWorkingHourOverride" ADD CONSTRAINT "StaffWorkingHourOverride_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTimeOff" ADD CONSTRAINT "StaffTimeOff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHourOverride" ADD CONSTRAINT "WorkingHourOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentHistory" ADD CONSTRAINT "AppointmentHistory_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentImage" ADD CONSTRAINT "AppointmentImage_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryMedia" ADD CONSTRAINT "GalleryMedia_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "GalleryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionService" ADD CONSTRAINT "PromotionService_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionService" ADD CONSTRAINT "PromotionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipConfiguration" ADD CONSTRAINT "VipConfiguration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipConfiguration" ADD CONSTRAINT "VipConfiguration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "LoyaltyLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "LoyaltyTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLevelHistory" ADD CONSTRAINT "ClientLevelHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLevelHistory" ADD CONSTRAINT "ClientLevelHistory_previousLevelId_fkey" FOREIGN KEY ("previousLevelId") REFERENCES "LoyaltyLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLevelHistory" ADD CONSTRAINT "ClientLevelHistory_newLevelId_fkey" FOREIGN KEY ("newLevelId") REFERENCES "LoyaltyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyBadge" ADD CONSTRAINT "LoyaltyBadge_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBadge" ADD CONSTRAINT "ClientBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBadge" ADD CONSTRAINT "ClientBadge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBadge" ADD CONSTRAINT "ClientBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "LoyaltyBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAchievement" ADD CONSTRAINT "LoyaltyAchievement_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAchievement" ADD CONSTRAINT "ClientAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAchievement" ADD CONSTRAINT "ClientAchievement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAchievement" ADD CONSTRAINT "ClientAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "LoyaltyAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReward" ADD CONSTRAINT "ClientReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReward" ADD CONSTRAINT "ClientReward_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReward" ADD CONSTRAINT "ClientReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardUsage" ADD CONSTRAINT "RewardUsage_clientRewardId_fkey" FOREIGN KEY ("clientRewardId") REFERENCES "ClientReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipShopItem" ADD CONSTRAINT "VipShopItem_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipShopPurchase" ADD CONSTRAINT "VipShopPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipShopPurchase" ADD CONSTRAINT "VipShopPurchase_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipShopPurchase" ADD CONSTRAINT "VipShopPurchase_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "VipShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipShopPurchase" ADD CONSTRAINT "VipShopPurchase_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipGiftTransfer" ADD CONSTRAINT "VipGiftTransfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipGiftTransfer" ADD CONSTRAINT "VipGiftTransfer_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipGiftTransfer" ADD CONSTRAINT "VipGiftTransfer_clientRewardId_fkey" FOREIGN KEY ("clientRewardId") REFERENCES "ClientReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipAuditLog" ADD CONSTRAINT "VipAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestPointEntry" ADD CONSTRAINT "ContestPointEntry_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestPointEntry" ADD CONSTRAINT "ContestPointEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestWinner" ADD CONSTRAINT "ContestWinner_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestWinner" ADD CONSTRAINT "ContestWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestWinner" ADD CONSTRAINT "ContestWinner_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientChallenge" ADD CONSTRAINT "ClientChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientChallenge" ADD CONSTRAINT "ClientChallenge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientChallenge" ADD CONSTRAINT "ClientChallenge_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSeasonPass" ADD CONSTRAINT "ClientSeasonPass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSeasonPass" ADD CONSTRAINT "ClientSeasonPass_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipTeamMember" ADD CONSTRAINT "VipTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipAutomationRule" ADD CONSTRAINT "VipAutomationRule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipAutomationRule" ADD CONSTRAINT "VipAutomationRule_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipEvent" ADD CONSTRAINT "VipEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipEvent" ADD CONSTRAINT "VipEvent_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "VipReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingRecommendation" ADD CONSTRAINT "MarketingRecommendation_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingRecommendation" ADD CONSTRAINT "MarketingRecommendation_dismissedById_fkey" FOREIGN KEY ("dismissedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

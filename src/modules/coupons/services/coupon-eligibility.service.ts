import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from '../../../schemas/address.schema';
import { Coupon } from '../../../schemas/coupon.schema';
import { User } from '../../../schemas/user.schema';

export interface CouponEligibilityResult {
  isEligible: boolean;
  reason?: string;
}

@Injectable()
export class CouponEligibilityService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
  ) {}

  async validate(
    coupon: Coupon,
    userId: string,
    addressId?: string,
  ): Promise<CouponEligibilityResult> {
    const maxUsesPerUser = coupon.maxUsesPerUser || 1;
    const currentUserUses = this.getUserUses(coupon.usedByUsers, userId);

    if (currentUserUses >= maxUsesPerUser) {
      return { isEligible: false, reason: 'COUPON_ALREADY_USED' };
    }

    const previousUserIds = this.getPreviousUserIds(coupon.usedByUsers, userId);
    if (!previousUserIds.length) {
      return { isEligible: true };
    }

    const [currentIdentity, previousIdentity] = await Promise.all([
      this.buildCurrentUserIdentity(userId, addressId),
      this.buildPreviousUsersIdentity(previousUserIds),
    ]);

    if (this.hasIntersection(currentIdentity.phones, previousIdentity.phones)) {
      return { isEligible: false, reason: 'COUPON_ALREADY_USED_BY_PHONE' };
    }

    if (
      this.hasIntersection(currentIdentity.addresses, previousIdentity.addresses)
    ) {
      return { isEligible: false, reason: 'COUPON_ALREADY_USED_BY_ADDRESS' };
    }

    return { isEligible: true };
  }

  private getUserUses(
    usedByUsers: Map<string, number> | Record<string, number>,
    userId: string,
  ): number {
    if (!usedByUsers) return 0;

    if (typeof (usedByUsers as Map<string, number>).get === 'function') {
      return (usedByUsers as Map<string, number>).get(userId) || 0;
    }

    return Number((usedByUsers as Record<string, number>)[userId] || 0);
  }

  private getPreviousUserIds(
    usedByUsers: Map<string, number> | Record<string, number>,
    currentUserId: string,
  ): string[] {
    if (!usedByUsers) return [];

    const entries =
      typeof (usedByUsers as Map<string, number>).entries === 'function'
        ? Array.from((usedByUsers as Map<string, number>).entries())
        : Object.entries(usedByUsers as Record<string, number>);

    return entries
      .filter(([userId, uses]) => userId !== currentUserId && Number(uses) > 0)
      .map(([userId]) => userId);
  }

  private async buildCurrentUserIdentity(userId: string, addressId?: string) {
    const [user, userAddresses, selectedAddress] = await Promise.all([
      this.userModel.findById(userId).lean().exec(),
      this.addressModel.find({ userId }).lean().exec(),
      addressId ? this.addressModel.findById(addressId).lean().exec() : null,
    ]);

    return this.buildIdentity(
      user ? [user] : [],
      this.mergeAddresses(userAddresses, selectedAddress),
    );
  }

  private async buildPreviousUsersIdentity(userIds: string[]) {
    const [users, addresses] = await Promise.all([
      this.userModel.find({ _id: { $in: userIds } }).lean().exec(),
      this.addressModel.find({ userId: { $in: userIds } }).lean().exec(),
    ]);

    return this.buildIdentity(users, addresses);
  }

  private buildIdentity(users: any[], addresses: any[]) {
    const phones = new Set<string>();
    const normalizedAddresses = new Set<string>();

    users.forEach((user) => {
      this.normalizePhone(user.phoneNumber).forEach((phone) => phones.add(phone));
    });

    addresses.forEach((address) => {
      this.normalizePhone(address.phone).forEach((phone) => phones.add(phone));
      this.normalizeAddress(address).forEach((normalizedAddress) =>
        normalizedAddresses.add(normalizedAddress),
      );
    });

    return { phones, addresses: normalizedAddresses };
  }

  private mergeAddresses(addresses: any[], selectedAddress: any) {
    if (!selectedAddress) return addresses;

    const selectedId = selectedAddress._id?.toString();
    const alreadyIncluded = addresses.some(
      (address) => address._id?.toString() === selectedId,
    );

    return alreadyIncluded ? addresses : [...addresses, selectedAddress];
  }

  private normalizePhone(phone?: string): string[] {
    const digits = phone?.replace(/\D/g, '') || '';
    if (!digits) return [];

    const normalizedDigits = digits.startsWith('00') ? digits.slice(2) : digits;
    const variants = new Set([normalizedDigits]);

    if (normalizedDigits.length >= 10) {
      variants.add(normalizedDigits.slice(-10));
    }

    return Array.from(variants);
  }

  private normalizeAddress(address: any): string[] {
    const street = this.normalizeText(address.address);
    if (!street) return [];

    const base = [
      street,
      this.normalizeText(address.city),
      this.normalizeText(address.zipCode),
    ]
      .filter(Boolean)
      .join('|');

    const withApartment = [
      base,
      this.normalizeText(address.floorNumber),
      this.normalizeText(address.departmentNumber),
    ]
      .filter(Boolean)
      .join('|');

    return Array.from(new Set([base, withApartment].filter(Boolean)));
  }

  private normalizeText(value?: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  private hasIntersection(first: Set<string>, second: Set<string>): boolean {
    for (const value of first) {
      if (second.has(value)) return true;
    }

    return false;
  }
}

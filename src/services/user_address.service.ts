import UserAddress from '../../models/userAddress';

interface CreateAddressDTO {
  user_id: number;
  address_type?: 'current' | 'permanent';
  latitude: string;
  longitude: string;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  address?: string;
}

interface UpdateAddressDTO extends Partial<CreateAddressDTO> { }

export const UserAddressService = {
  async createAddress(data: any) {
    try {
      const existingAddress = await UserAddress.findOne({
        user_id: data.user_id
      })
      if (existingAddress) {
        return existingAddress;
      }
      console.log("======>>>", data);
      const address = await UserAddress.create(data);
      return address;
    } catch (error: any) {
      console.error('Error in createAddress:', error);
      throw new Error('Failed to create user address');
    }
  },

  async getUserAddresses(user_id: number) {
    try {
      const addresses = await UserAddress.find({ user_id });
      return addresses;
    } catch (error: any) {
      console.error('Error in getUserAddresses:', error);
      throw new Error('Failed to retrieve user addresses');
    }
  },

  async updateAddress(id: number, data: UpdateAddressDTO) {
    try {
      const address = await UserAddress.findById(id);
      if (!address) throw new Error('Address not found');

      await UserAddress.findByIdAndUpdate(id, data);
      return address;
    } catch (error: any) {
      console.error('Error in updateAddress:', error);
      throw new Error(error.message || 'Failed to update address');
    }
  },

  async deleteAddress(id: number) {
    try {
      const address = await UserAddress.findById(id);
      if (!address) throw new Error('Address not found');

      await UserAddress.findByIdAndDelete(id);
      return { message: 'Address deleted successfully' };
    } catch (error: any) {
      console.error('Error in deleteAddress:', error);
      throw new Error(error.message || 'Failed to delete address');
    }
  }
};

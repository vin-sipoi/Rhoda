module.exports = {
  async updateMe(ctx) {
    const { id } = ctx.state.user;
    const { username, email } = ctx.request.body;

    try {
      // Validate that the user is updating their own profile
      if (!id) {
        return ctx.badRequest('User not authenticated');
      }

      // Prepare update data
      const updateData = {};
      
      if (username !== undefined) {
        // Check if username is unique (excluding current user)
        const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
          where: { username, id: { $ne: id } }
        });
        
        if (existingUser) {
          return ctx.badRequest('Username already taken');
        }
        
        updateData.username = username;
      }
      
      if (email !== undefined) {
        // Check if email is unique (excluding current user)
        const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
          where: { email, id: { $ne: id } }
        });
        
        if (existingUser) {
          return ctx.badRequest('Email already taken');
        }
        
        updateData.email = email;
      }

      // Update the user
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id },
        data: updateData,
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        provider: updatedUser.provider,
        confirmed: updatedUser.confirmed,
        blocked: updatedUser.blocked,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        role: updatedUser.role,
      };

      ctx.body = sanitizedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      ctx.internalServerError('Failed to update profile');
    }
  },
};

// Middleware to check if user is admin
export default (req, res, next) => {
  console.log('🔍 Checking admin access for user:', { 
    id: req.user?.id, 
    userType: req.user?.userType, 
    isAdmin: req.user?.isAdmin 
  });
  
  if (req.user && req.user.isAdmin) {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - user is not admin');
    res.status(403).json({ 
      message: 'Admin access required', 
      userInfo: { 
        hasUser: !!req.user, 
        isAdmin: req.user?.isAdmin || false,
        userType: req.user?.userType 
      } 
    });
  }
};

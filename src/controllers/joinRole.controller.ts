import { Request, Response } from 'express';
import Employee from '../../models/Employee';
import Teacher from '../../models/Teacher';
import Student from '../../models/Student';
import Team from '../../models/Team';
import Class from '../../models/Class';
import School from '../../models/School';

interface JwtUser {
  id: string;
  role: 'EMPLOYEE' | 'TEAM_LEAD' | 'TEACHER' | 'STUDENT';
}

export const joinRole = async (req: Request, res: Response) => {
  try {
    const { teamCode, classCode } = req.body;
    const decoded = (req as any).user as JwtUser;

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id: userId, role: tokenRole } = decoded;

    // ✅ Extract same Bearer token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    let user: any = null;

    if (tokenRole === 'EMPLOYEE' || tokenRole === 'TEAM_LEAD')
      user = await Employee.findById(userId);

    if (tokenRole === 'TEACHER')
      user = await Teacher.findById(userId);

    if (tokenRole === 'STUDENT')
      user = await Student.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // ================= EMPLOYEE =================
    if (tokenRole === 'EMPLOYEE') {
      if (!teamCode)
        return res.status(400).json({ success: false, message: 'teamCode required' });

      const team = await Team.findOne({ teamCode });
      if (!team)
        return res.status(404).json({ success: false, message: 'Invalid Team Code' });

      user.teamId = team._id;
      user.position = 'employee';
      await user.save();

      return res.set('Authorization', `Bearer ${token}`).json({
        success: true,
        message: 'Employee joined team successfully',
        token,
        employee: {
          ...user.toObject(),
          teamName: team.name,
          isTeamLead: false
        }
      });
    }

    // ================= TEAM LEAD =================
    if (tokenRole === 'TEAM_LEAD') {
      if (!teamCode)
        return res.status(400).json({ success: false, message: 'teamCode required' });

      const team = await Team.findOne({ teamCode });
      if (!team)
        return res.status(404).json({ success: false, message: 'Invalid Team Code' });

      if (team.teamLead && team.teamLead.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This team already has a Team Lead'
        });
      }

      user.teamId = team._id;
      user.position = 'teamlead';
      await user.save();

      team.teamLead = user._id;
      await team.save();

      return res.set('Authorization', `Bearer ${token}`).json({
        success: true,
        message: 'Team Lead joined successfully',
        token,
        teamLead: {
          ...user.toObject(),
          teamName: team.name,
          isTeamLead: true
        }
      });
    }

    // ================= TEACHER =================
    if (tokenRole === 'TEACHER') {
      if (!classCode)
        return res.status(400).json({ success: false, message: 'classCode required' });

      const cls = await Class.findOne({ classCode });
      if (!cls)
        return res.status(404).json({ success: false, message: 'Invalid Class Code' });

      if (cls.teacher && cls.teacher.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This class already has a teacher'
        });
      }

      user.classId = cls._id;
      user.teacherCode ||= `TCH-${Date.now()}`;
      await user.save();

      cls.teacher = user._id;
      await cls.save();

      const school = await School.findById(cls.schoolId);

      return res.set('Authorization', `Bearer ${token}`).json({
        success: true,
        message: 'Teacher joined class successfully',
        token,
        teacher: {
          ...user.toObject(),
          className: cls.name,
          schoolName: school?.name || null
        }
      });
    }

    // ================= STUDENT =================
    if (tokenRole === 'STUDENT') {
      if (!classCode)
        return res.status(400).json({ success: false, message: 'classCode required' });

      const cls = await Class.findOne({ classCode });
      if (!cls)
        return res.status(404).json({ success: false, message: 'Invalid Class Code' });

      user.classId = cls._id;
      user.teacherId = cls.teacher;
      user.schoolId = cls.schoolId;
      user.studentCode ||= `STD-${Date.now()}`;
      await user.save();

      const school = await School.findById(cls.schoolId);

      return res.set('Authorization', `Bearer ${token}`).json({
        success: true,
        message: 'Student joined class successfully',
        token,
        student: {
          ...user.toObject(),
          className: cls.name,
          schoolName: school?.name || null
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role' });

  } catch (error) {
    console.error('JoinRole Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

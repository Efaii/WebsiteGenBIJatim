import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/profile');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Update organization profile
 * @route PATCH /api/profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const updated = await profileService.updateProfile(data);
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('[Admin Profile Controller] Error updating profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
};

/**
 * Create/Update Board Member
 */
export const upsertMember = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;

    // Parse numeric fields from multipart/form-data
    if (data.order !== undefined) {
      data.order = parseInt(data.order as string, 10);
    }
    
    let result;
    let existing;
    
    if (id) {
       // Need to fetch existing to manage old image
       const bph = await (profileService as any).MemberService.getAll(); // A bit inefficient but works for now unless we add findById
       existing = bph.find((m: any) => m.id === id);
    }

    if (req.file) {
      const filename = `${Date.now()}-${data.name.replace(/\s+/g, '-').toLowerCase()}.webp`;
      const savePath = path.join(UPLOAD_DIR, filename);

      await sharp(req.file.buffer)
        .resize({ width: 500, height: 500, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(savePath);

      data.image = `/uploads/profile/${filename}`;

      // Delete old image if it exists
      if (existing?.image && existing.image.startsWith('/uploads/profile/')) {
        const oldPath = path.join(__dirname, '../../public', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    if (id) {
      result = await profileService.MemberService.update(id, data);
    } else {
      result = await profileService.MemberService.create(data);
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[Admin Profile Controller] Error upserting member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save member' });
  }
};

/**
 * Delete Member
 */
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch member to get image path for deletion
    const bph = await (profileService as any).MemberService.getAll();
    const existing = bph.find((m: any) => m.id === id);

    if (existing?.image && existing.image.startsWith('/uploads/profile/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await profileService.MemberService.delete(id);
    res.status(200).json({ status: 'success', message: 'Member deleted' });
  } catch (error) {
    console.error('[Admin Profile Controller] Error deleting member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete member' });
  }
};

export const upsertDivision = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const organizationProfileId = req.query.organizationProfileId as string || data.organizationProfileId;

    let result;
    if (id) {
      result = await profileService.DivisionService.update(id, data);
    } else {
      result = await profileService.DivisionService.create({ ...data, organizationProfileId });
    }
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('[Admin Profile Controller] Error upserting division:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save division' });
  }
};

export const deleteDivision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await profileService.DivisionService.delete(id);
    res.status(200).json({ status: 'success', message: 'Division deleted' });
  } catch (error) {
    console.error('[Admin Profile Controller] Error deleting division:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete division' });
  }
};

export const getDivisions = async (req: Request, res: Response) => {
  try {
    const organizationProfileId = req.query.organizationProfileId as string;
    const result = await profileService.DivisionService.getAll(organizationProfileId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[Admin Profile Controller] Error fetching divisions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch divisions' });
  }
};

export const upsertMission = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const organizationProfileId = req.query.organizationProfileId as string || data.organizationProfileId;
    
    let result;
    if (id) {
      result = await profileService.MissionService.update(id, data, organizationProfileId);
    } else {
      result = await profileService.MissionService.create({ ...data, organizationProfileId });
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('[Admin Profile Controller] Error upserting mission:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save mission' });
  }
};

/**
 * Delete Mission
 */
export const deleteMission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationProfileId = req.query.organizationProfileId as string;
    await profileService.MissionService.delete(id, organizationProfileId);
    res.status(200).json({
      status: 'success',
      message: 'Mission deleted'
    });
  } catch (error) {
    console.error('[Admin Profile Controller] Error deleting mission:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete mission' });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await profileService.createProfile(data);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    console.error('[Admin Profile Controller] Error creating profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create profile' });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await profileService.deleteProfile(id);
    res.status(200).json({ status: 'success', message: 'Profile deleted' });
  } catch (error) {
    console.error('[Admin Profile Controller] Error deleting profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete profile' });
  }
};

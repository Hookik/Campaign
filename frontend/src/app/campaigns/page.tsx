/**
 * Campaigns Page
 * Creator view: Browse & discover campaigns with filters, match scores, and earnings preview
 * Business view: Manage owned campaigns with status tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { brandCampaignApi, creatorCampaignApi } from '@/services/campaignService';
import {
  DEMO_CAMPAIGNS, formatNaira, formatCompact, getDaysLeft, getTimeAgo,
  getNicheIcon, getPlatformIcon, getMatchColor,
} from '@/lib/demoData';

type NicheFilter = 'all' | 'beauty' | 'fashion' | 'food' | 'tech' | 'fitness' | 'lifestyle';
type TypeFilter =
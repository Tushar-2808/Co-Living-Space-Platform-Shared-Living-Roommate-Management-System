/**
 * Roommate Compatibility Matching Service
 * Weighted scoring across 8 lifestyle dimensions.
 */

const WEIGHTS = {
    smoking: 0.20,
    pets: 0.15,
    cleanliness: 0.15,
    lateNight: 0.12,
    workFromHome: 0.10,
    socialPreference: 0.10,
    foodPreference: 0.08,
    guestPolicy: 0.10,
};

// Partial match tables (returns 0–1 score for a pair)
const PARTIAL = {
    smoking: (a, b) => {
        if (a === b) return 1;
        if ((a === 'never' && b === 'occasionally') || (a === 'occasionally' && b === 'never')) return 0.5;
        return 0;
    },
    pets: (a, b) => {
        if (a === b) return 1;
        if (a === 'allergic' || b === 'allergic') return 0.2;
        return 0.6;
    },
    cleanliness: (a, b) => {
        const order = { relaxed: 0, moderate: 1, very_clean: 2 };
        const diff = Math.abs(order[a] - order[b]);
        return diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
    },
    lateNight: (a, b) => {
        if (a === b) return 1;
        if ((a === 'moderate' && b !== 'moderate') || (b === 'moderate' && a !== 'moderate')) return 0.6;
        return 0;
    },
    workFromHome: (a, b) => {
        if (a === b) return 1;
        if ((a === 'always' && b === 'sometimes') || (a === 'sometimes' && b === 'always')) return 0.6;
        return 0.7;
    },
    socialPreference: (a, b) => {
        if (a === b) return 1;
        if (a === 'ambivert' || b === 'ambivert') return 0.6;
        return 0;
    },
    foodPreference: (a, b) => {
        if (a === b) return 1;
        if (a === 'any' || b === 'any') return 0.9;
        if ((a === 'veg' && b === 'vegan') || (a === 'vegan' && b === 'veg')) return 0.7;
        return 0;
    },
    guestPolicy: (a, b) => {
        if (a === b) return 1;
        if ((a === 'frequent' && b === 'occasional') || (a === 'occasional' && b === 'frequent')) return 0.6;
        if (a === 'no_guests' || b === 'no_guests') return 0.2;
        return 0.5;
    },
};

/**
 * Calculate compatibility between two lifestyle profiles.
 * @param {Object} profileA - Applicant's lifestyle profile
 * @param {Object} profileB - Existing tenant's lifestyle profile
 * @returns {{ score: number, breakdown: Object }}
 */
const calcPairScore = (profileA, profileB) => {
    let totalScore = 0;
    const breakdown = {};

    for (const [attr, weight] of Object.entries(WEIGHTS)) {
        const a = profileA[attr];
        const b = profileB[attr];
        const raw = a && b ? PARTIAL[attr](a, b) : 0.5; // neutral if missing
        const weighted = raw * weight * 100;
        breakdown[attr] = Math.round(weighted);
        totalScore += weighted;
    }

    return { score: Math.round(totalScore), breakdown };
};

/**
 * Calculate compatibility score of applicant vs all current tenants (average).
 * @param {Object} applicantProfile
 * @param {Array}  tenantProfiles - Array of existing tenants' lifestyle profiles
 * @returns {{ score: number, breakdown: Object }}
 */
const calculateCompatibility = (applicantProfile, tenantProfiles) => {
    if (!tenantProfiles || tenantProfiles.length === 0) {
        return { score: 100, breakdown: {} }; // empty room — perfect score
    }

    const results = tenantProfiles.map((tp) => calcPairScore(applicantProfile, tp.lifestyleProfile || tp));
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    // Average breakdown per attribute
    const avgBreakdown = {};
    for (const attr of Object.keys(WEIGHTS)) {
        avgBreakdown[attr] = Math.round(results.reduce((sum, r) => sum + (r.breakdown[attr] || 0), 0) / results.length);
    }

    return { score: avgScore, breakdown: avgBreakdown };
};

/**
 * Get tier label for a score.
 */
const getScoreTier = (score) => {
    if (score >= 80) return { tier: 'Excellent', color: 'green' };
    if (score >= 60) return { tier: 'Good', color: 'blue' };
    if (score >= 40) return { tier: 'Fair', color: 'orange' };
    return { tier: 'Low', color: 'red' };
};

module.exports = { calculateCompatibility, getScoreTier };

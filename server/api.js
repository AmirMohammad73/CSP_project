const { query, pool } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'efd6401dca50843be8272263a61b1a97959fdfafb1f0bcedc6210269c7c84902';

const getMapStatusData = async (role, permission) => {
	  let whereClause = '';
	  let location = 'ostantitle';
  // Add a WHERE clause if the role is 4 or 1
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }

  const sql = `
    SELECT 
      ${location} AS "استان",
      COUNT(CASE WHEN adam_paziresh THEN 1 END) AS "بنیاد مسکن",
      COUNT(CASE WHEN niazmande_eslah THEN 1 END) AS "سایر منابع",
      COUNT(CASE WHEN arseh_ayan THEN 1 END) AS "ترسیم",
      COUNT(*) AS "مجموع روستاها"
    FROM 
      public.locations1
	${whereClause}
    GROUP BY 
      ${location}
    ORDER BY 
      ${location};
  `;
  return await query(sql);
};
const changePassword = async (userId, currentPassword, newPassword, repeatNewPassword) => {
  // Fetch the user from the database
  const userQuery = 'SELECT password_hash FROM public.users1 WHERE user_id = $1';
  const userResult = await pool.query(userQuery, [userId]);

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  // Verify the current password
  if (currentPassword !== user.password_hash) {
    throw new Error('Current password is incorrect');
  }

  // Check if new passwords match
  if (newPassword !== repeatNewPassword) {
    throw new Error('New passwords do not match');
  }

  // Update the password in the database
  const updateQuery = 'UPDATE public.users1 SET password_hash = $1 WHERE user_id = $2';
  await pool.query(updateQuery, [newPassword, userId]);

  return { message: 'Password changed successfully' };
};
const getGnafIndexData = async (role, permission) => {
	  let whereClause = '';
	  let location = 'ostantitle';
  // Add a WHERE clause if the role is 4 or 1
  const sql = `SELECT 'جمع کشوری'AS "استان", SUM(((shahr_percent).pishbini - (shahr_percent).tahaghogh)) AS "درصد پیشبینی شهری", SUM((shahr_percent).tahaghogh) AS "تحقق شهری", SUM(((roosta_percent).pishbini - (roosta_percent).tahaghogh)) AS "درصد پیشبینی روستایی", SUM((roosta_percent).tahaghogh) AS "تحقق روستایی" FROM public.loc_gnaf UNION ALL (SELECT ostantitle, ((shahr_percent).pishbini - (shahr_percent).tahaghogh) AS "درصد پیشبینی شهری", (shahr_percent).tahaghogh AS "تحقق شهری", ((roosta_percent).pishbini - (roosta_percent).tahaghogh) AS "درصد پیشبینی روستایی", (roosta_percent).tahaghogh AS "تحقق روستایی" FROM public.loc_gnaf order by ostantitle);`;
  return await query(sql);
};
// Function to fetch username by userId
const getUsernameById = async (userId) => {
  const sql = `SELECT username FROM public.users1 WHERE user_id = $1;`;
  const result = await query(sql, [userId]);
  return result.length > 0 ? result[0].username : null;
};

// Function to format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};
const getTimestampByUsername = async (username) => {
  const sql = `SELECT timestamp FROM public.users1 WHERE username = $1;`;
  const result = await query(sql, [username]);
  return result.length > 0 ? result[0].timestamp : null;
};

// Function to fetch notifications dynamically
const getNotifications = async (username, timestamp) => {
  const userTimestamp = await getTimestampByUsername(username);
  const formattedTimestamp = formatTimestamp(timestamp || userTimestamp);
  const sql = `
    SELECT id, content, date, icon,
       CASE WHEN date > $1::timestamp THEN false ELSE true END AS seen
    FROM (
        SELECT id, content, date, icon
        FROM public.notification
        WHERE ('broadcast' = ANY(targets) OR $2 = ANY(targets))
        ORDER BY date DESC
        LIMIT 10
    ) subquery
    ORDER BY date DESC;
  `;
  return await query(sql, [userTimestamp, username]);
};


const getUpdateStatusData = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }

  const sql = `SELECT 
      ${location} AS "استان",
      COUNT(CASE WHEN amaliate_meydani THEN 1 END) AS "عملیات میدانی",
      COUNT(CASE WHEN dadeh_amaei THEN 1 END) AS "داده آمائی",
      COUNT(CASE WHEN eslah_naghsheh THEN 1 END) AS "اصلاح و ارسال",
      COUNT(*) AS "مجموع روستاها"
    FROM 
      public.locations1
	${whereClause}
    GROUP BY 
      ${location}
    ORDER BY 
      ${location};`;
  return await query(sql);
};

const getGeocodeStatusData = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }
  const sql = `SELECT 
      ${location} AS "استان",
      COUNT(CASE WHEN eslah_naghsheh THEN 1 END) AS "اصلاح و ارسال",
      COUNT(CASE WHEN tayid_va_bargozari THEN 1 END) AS "تایید و بارگذاری",
      COUNT(CASE WHEN daryafte_naghsheh THEN 1 END) AS "ژئوکد",
      COUNT(*) AS "مجموع روستاها"
    FROM 
      public.locations1
	${whereClause}
    GROUP BY 
      ${location}
    ORDER BY 
      ${location};`;
  return await query(sql);
};

const getPlateStatusData = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }
  const sql = `SELECT 
      ${location} AS "استان",
      COUNT(CASE WHEN tolid_qr THEN 1 END) AS "تولید QR",
      COUNT(CASE WHEN pelak_talfighi THEN 1 END) AS "نصب پلاک",
      COUNT(*) AS "مجموع روستاها"
    FROM 
      public.locations1
	${whereClause}
    GROUP BY 
      ${location}
    ORDER BY 
      ${location};`;
  return await query(sql);
};

const getPieMap = async (role, permission) => {
  let whereClause = '';
  // Add a WHERE clause if the role is 4 or 1
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  // Updated SQL query with dynamic WHERE clause
  const sql = `
    SELECT
      SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS bonyad_maskan,
      SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS tarsim,
      SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS sayer_manabe,
      COUNT(*) - SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) - 
                 SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) - 
                 SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS remaining_count
    FROM public.locations1
    ${whereClause};`;

  return await query(sql);
};
const getProgressData = async () => {
  const sql = `SELECT * FROM public.progress_data;`;
  return await query(sql);
};
// Function to construct and execute the SQL query
const getQueryData = async (selectedItems, role, permission, groupingLevel = 'roosta') => {
    let whereCondition = '';

    if (role === '4' || role === '1') {
        const conditions = permission.map(region => `'${region}'`).join(', ');
        whereCondition = `AND ostantitle IN (${conditions})`;
    }

    if (selectedItems && selectedItems.length > 0) {
        const formattedItems = selectedItems.map(item => `'${item}'`).join(', ');
        whereCondition = `AND ostantitle IN (${formattedItems})`;
    }

    if (groupingLevel === 'roosta') {
        const sql = `
        SELECT 
            ostantitle, 
            shahrestantitle, 
            zonetitle, 
            dehestantitle, 
            locationname, 
            population_point_id, 
            adam_paziresh AS bonyad_maskan, 
            niazmande_eslah AS sayer_manabe,
            arseh_ayan AS tarsim, 
            amaliate_meydani, 
            dadeh_amaei, 
            eslah_naghsheh, 
            daryafte_naghsheh AS geocode, 
            pdf, 
            ersal_setad,
            SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS tedad_geocode_makan,
            SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS tedad_makan_jadid,
            SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS tedad_sakhteman,
            tedad_makan,
            SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS tedad_geosakhteman,
            tayid_va_bargozari,
            (COALESCE(NULLIF(tedad_parcel, '')::integer, 0) + COALESCE(NULLIF(tedad_parcel_tarsimi, '')::integer, 0)) AS total_parcels
        FROM 
            public.locations1
        WHERE 
            ((adam_paziresh = true
            OR niazmande_eslah = true 
            OR arseh_ayan = true) 
            OR amaliate_meydani = true 
            OR dadeh_amaei = true 
            OR eslah_naghsheh = true 
            OR daryafte_naghsheh = true
            OR pdf = true 
            OR ersal_setad = true)
            ${whereCondition}
        GROUP BY
            ostantitle, 
            shahrestantitle, 
            zonetitle, 
            dehestantitle, 
            locationname, 
            population_point_id, 
            adam_paziresh, 
            niazmande_eslah,
            arseh_ayan, 
            amaliate_meydani, 
            dadeh_amaei, 
            eslah_naghsheh, 
            daryafte_naghsheh, 
            pdf, 
            ersal_setad,
            tedad_makan,
            tayid_va_bargozari,
            (COALESCE(NULLIF(tedad_parcel, '')::integer, 0) + COALESCE(NULLIF(tedad_parcel_tarsimi, '')::integer, 0))
        ORDER BY 
            ostantitle, 
            shahrestantitle, 
            zonetitle, 
            dehestantitle, 
            locationname`;
        return await query(sql);
    }

    // ... existing code for other grouping levels ...
    let groupByColumns = '';
    switch(groupingLevel) {
        case 'ostan':
            groupByColumns = 'ostantitle';
            break;
        case 'shahrestan':
            groupByColumns = 'ostantitle, shahrestantitle';
            break;
        case 'bakhsh':
            groupByColumns = 'ostantitle, shahrestantitle, zonetitle';
            break;
        case 'dehestan':
            groupByColumns = 'ostantitle, shahrestantitle, zonetitle, dehestantitle';
            break;
    }

    const sql = `
    SELECT 
        ${groupByColumns},
        SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS bonyad_maskan,
        SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS sayer_manabe,
        SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS tarsim,
        SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani,
        SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei,
        SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh,
        SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS geocode,
        SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS pdf,
        SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS ersal_setad,
        SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true 
            THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS tedad_geocode_makan,
        SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani 
            THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS tedad_makan_jadid,
        SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true 
            THEN tedad_sakhteman::INTEGER ELSE 0 END) AS tedad_sakhteman,
        SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' 
            THEN tedad_makan::INTEGER ELSE 0 END) AS tedad_makan,
        SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true 
            THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS tedad_geosakhteman,
        SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari,
        SUM(COALESCE(NULLIF(tedad_parcel, '')::integer, 0) + 
            COALESCE(NULLIF(tedad_parcel_tarsimi, '')::integer, 0)) AS total_parcels
    FROM 
        public.locations1
    WHERE 
        (adam_paziresh = true
        OR niazmande_eslah = true 
        OR arseh_ayan = true 
        OR amaliate_meydani = true 
        OR dadeh_amaei = true 
        OR eslah_naghsheh = true 
        OR daryafte_naghsheh = true 
        OR pdf = true 
        OR ersal_setad = true)
        ${whereCondition}
    GROUP BY 
        ${groupByColumns}
    ORDER BY 
        ${groupByColumns}`;

    return await query(sql);
};
const getNationalIDStatusData = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }
  const sql = `SELECT 
      ${location} AS "استان",
      COUNT(shenaseh_melli) AS "شناسه ملی",
      COUNT(*) AS "مجموع روستاها"
    FROM 
      public.locations1
	  ${whereClause}
    GROUP BY 
      ${location}
    ORDER BY 
      ${location};`;
  return await query(sql);
};

const getLocationsData = async () => {
  const sql = `SELECT
    1 AS row_number,
    'ایران' AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2;`;
  return await query(sql);
};
const getCityLocationsData = async () => {
  const sql = `SELECT
    1 AS row_number,
    'ایران' AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2;`;
  return await query(sql);
};
const getMapCount = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS stats
FROM 
    public.locations1 l2
	${whereClause};`;
  return await query(sql);
};
const getUpdateCount = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS stats
FROM 
    public.locations1 l2
	${whereClause};`;
  return await query(sql);
};
const getDadehCount = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS stats
FROM 
    public.locations1 l2
	${whereClause};`;
  return await query(sql);
};
const getGeoCount = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS stats
FROM 
    public.locations1 l2
	${whereClause};`;
  return await query(sql);
};
const getRadarData = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
	SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS mokhtasat_rousta_count,
	SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS mahdoudeh_rousta_count
FROM 
    public.locations1 l2
	${whereClause};`;
  return await query(sql);
};

const getDetailedLocationsData = async (user) => {
  let whereClause = '';
  if (user.role === '4' || user.role === '1') {
    // Add a WHERE clause for role 4 based on user permissions
    const conditions = user.permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }

  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY ostantitle) AS row_number,
    ostantitle AS locname,
    COUNT(*) AS total_count,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.ostantitle = l2.ostantitle
    ) AS total_record_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
${whereClause}
GROUP BY 
    ostantitle
ORDER BY 
    ostantitle;`;
  return await query(sql);
};
const getShahrestanData = async (ostantitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY shahrestantitle) AS row_number,
    shahrestantitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.shahrestantitle = l2.shahrestantitle AND ostantitle = $1
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM
    public.locations1 l2
WHERE
    ostantitle = $1
GROUP BY
    shahrestantitle
ORDER BY
    shahrestantitle;;
    `;
  return await query(sql, [ostantitle]);
};
const getZoneData = async (ostantitle, shahrestantitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY zonetitle) AS row_number,
    zonetitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.zonetitle = l2.zonetitle AND ostantitle = $1 AND shahrestantitle = $2
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
WHERE 
    ostantitle = $1 AND shahrestantitle = $2
GROUP BY 
    zonetitle
ORDER BY 
    zonetitle;`;
  return await query(sql, [ostantitle, shahrestantitle]);
};
const getShahrData = async (ostantitle, shahrestantitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY zonetitle) AS row_number,
    zonetitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.zonetitle = l2.zonetitle AND ostantitle = $1 AND shahrestantitle = $2
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
WHERE 
    ostantitle = $1 AND shahrestantitle = $2
GROUP BY 
    zonetitle
ORDER BY 
    zonetitle;`;
  return await query(sql, [ostantitle, shahrestantitle]);
};
const getDehestanData = async (ostantitle, shahrestantitle, zonetitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY dehestantitle) AS row_number,
    dehestantitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.dehestantitle = l2.dehestantitle AND ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
WHERE 
    ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3
GROUP BY 
    dehestantitle
ORDER BY 
    dehestantitle;`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle]);
};
const getRoostaData = async (ostantitle, shahrestantitle, zonetitle, dehestantitle) => {
  const sql = `SELECT
    l.ostantitle,
    l.shahrestantitle,
    l.zonetitle,
    l.dehestantitle,
    l.locationname,
    l.population_point_id,
    l.shenaseh_melli,
    l.adam_paziresh AS bonyad_maskan,
    l.niazmande_eslah AS sayer_manabe,
    l.arseh_ayan AS tarsim,
    COALESCE(NULLIF(REGEXP_REPLACE(l.tedad_parcel, '[^0-9]', '', 'g'), ''), '0')::int + 
    COALESCE(NULLIF(REGEXP_REPLACE(l.tedad_parcel_tarsimi, '[^0-9]', '', 'g'), ''), '0')::int AS tedad_parcel,

    -- amaliate_meydani_user_fullname
    CONCAT(ru.firstname, ' ', ru.lastname) AS amaliate_meydani_user_fullname,

    -- dadeh_amaei_user_fullname
    CONCAT(ru2.firstname, ' ', ru2.lastname) AS dadeh_amaei_user_fullname,

    l.eslah_naghsheh,
    l.daryafte_naghsheh AS geocode,
    l.adam_tayid,
    l.tayid_va_bargozari,
    l.pdf AS mokhtasat_rousta,
    l.ersal_setad AS mahdoudeh_rousta,
    l.tolid_qr,
    l.pelak_talfighi
FROM
    public.locations1 l

-- Join برای amaliate_meydani_user_fullname
LEFT JOIN record_users ru 
    ON l.amaliate_meydani_user_fullname = ru.user_id::TEXT

-- Join جدید برای dadeh_amaei_user_fullname
LEFT JOIN record_users ru2 
    ON l.dadeh_amaei_user_fullname = ru2.user_id::TEXT

WHERE
    l.ostantitle = $1
    AND l.shahrestantitle = $2
    AND l.zonetitle = $3
    AND l.dehestantitle = $4
    AND (l.locationtype = 'روستا' OR l.locationtype = 'آبادی')
ORDER BY locationname`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle, dehestantitle]);
};
const getBSCTab1Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(3, 2, 1, bsc) AS barnameh,
            total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 1
        GROUP BY ostantitle, amaliat, bsc, total_barnameh
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab2Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(12, 2, 2, bsc) AS barnameh,
            month_calc(12, 2, 2, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 2
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab3Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(12, 2, 3, bsc) AS barnameh,
            month_calc(12, 2, 3, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 3
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab4Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(12, 2, 4, bsc) AS barnameh,
            month_calc(12, 2, 4, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 4
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab5Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 5, bsc) AS barnameh,
            month_calc(12, 2, 5, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 5
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab6Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 6, bsc) AS barnameh,
            month_calc(12, 2, 6, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 6
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab7Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 7, bsc) AS barnameh,
            month_calc(12, 2, 7, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 7
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab8Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 8, bsc) AS barnameh,
            month_calc(12, 2, 8, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 8
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab9Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 9, bsc) AS barnameh,
            month_calc(12, 2, 9, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 9
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab10Data = async () => {
  const sql = `WITH bsc_summary AS (
    SELECT
        b.ostantitle,
        
        -- محاسبه amalkard از locations1
        (SELECT 
            SUM(
                CASE WHEN adam_paziresh THEN 1 ELSE 0 END +
                CASE WHEN arseh_ayan THEN 1 ELSE 0 END +
                CASE WHEN niazmande_eslah THEN 1 ELSE 0 END
            )
         FROM public.locations1 l
         WHERE l.ostantitle = b.ostantitle
        ) AS amalkard,

        -- محاسبه barnameh از month_calc - بدون ستون bsc
        month_calc(10, 2, b.amaliat) AS barnameh,

        -- محاسبه total_barnameh
        month_calc(12, 2, b.amaliat) AS total_barnameh,

        b.amaliat
    FROM public.bsc b
    WHERE b.amaliat = 10
    GROUP BY b.ostantitle, b.amaliat
)

-- section1
, section1_summary AS (
    SELECT
        ostantitle,
        amalkard,
        barnameh - amalkard AS dirkard,
        total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
        amaliat
    FROM bsc_summary
)

-- Calculate totals for section1
, section1_totals AS (
    SELECT
        'جمع کشوری' AS ostantitle,
        SUM(amalkard) AS amalkard,
        SUM(dirkard) AS dirkard,
        SUM(barnameh_diff) AS barnameh_diff,
        MAX(amaliat) AS amaliat
    FROM section1_summary
)

-- Combine results
(SELECT * FROM section1_totals)
UNION ALL
(SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab11Data = async () => {
  const sql = `WITH bsc_summary AS (
    SELECT
        b.ostantitle,
        
        -- محاسبه amalkard از locations1 - با استفاده از tedad_geocode_makan
        (SELECT 
            SUM(NULLIF(tedad_geocode_makan, '')::integer)
         FROM public.locations1 l
         WHERE l.ostantitle = b.ostantitle
        ) AS amalkard,

        -- محاسبه barnameh از month_calc
        month_calc(10, 2, b.amaliat) AS barnameh,

        -- محاسبه total_barnameh
        month_calc(12, 2, b.amaliat) AS total_barnameh,

        b.amaliat
    FROM public.bsc b
    WHERE b.amaliat = 11
    GROUP BY b.ostantitle, b.amaliat
)

-- section1
, section1_summary AS (
    SELECT
        ostantitle,
        amalkard,
        barnameh - amalkard AS dirkard,
        total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
        amaliat
    FROM bsc_summary
)

-- Calculate totals for section1
, section1_totals AS (
    SELECT
        'جمع کشوری' AS ostantitle,
        SUM(amalkard) AS amalkard,
        SUM(dirkard) AS dirkard,
        SUM(barnameh_diff) AS barnameh_diff,
        MAX(amaliat) AS amaliat
    FROM section1_summary
)

-- Combine results
(SELECT * FROM section1_totals)
UNION ALL
(SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab12Data = async () => {
  const sql = `WITH bsc_summary AS (
    SELECT
        b.ostantitle,
        
        -- محاسبه amalkard از locations1
        (SELECT 
            SUM(
                CASE WHEN ersal_setad THEN 1 ELSE 0 END
            )
         FROM public.locations1 l
         WHERE l.ostantitle = b.ostantitle
        ) AS amalkard,

        -- محاسبه barnameh از month_calc - بدون ستون bsc
        month_calc(10, 2, b.amaliat) AS barnameh,

        -- محاسبه total_barnameh
        month_calc(12, 2, b.amaliat) AS total_barnameh,

        b.amaliat
    FROM public.bsc b
    WHERE b.amaliat = 10
    GROUP BY b.ostantitle, b.amaliat
)

-- section1
, section1_summary AS (
    SELECT
        ostantitle,
        amalkard,
        barnameh - amalkard AS dirkard,
        total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
        amaliat
    FROM bsc_summary
)

-- Calculate totals for section1
, section1_totals AS (
    SELECT
        'جمع کشوری' AS ostantitle,
        SUM(amalkard) AS amalkard,
        SUM(dirkard) AS dirkard,
        SUM(barnameh_diff) AS barnameh_diff,
        MAX(amaliat) AS amaliat
    FROM section1_summary
)

-- Combine results
(SELECT * FROM section1_totals)
UNION ALL
(SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab13Data = async () => {
  const sql = `WITH bsc_summary AS (
    SELECT
        b.ostantitle,
        
        -- محاسبه amalkard از locations1
        (SELECT 
            SUM(
                CASE WHEN pdf THEN 1 ELSE 0 END
            )
         FROM public.locations1 l
         WHERE l.ostantitle = b.ostantitle
        ) AS amalkard,

        -- محاسبه barnameh از month_calc - بدون ستون bsc
        month_calc(10, 2, b.amaliat) AS barnameh,

        -- محاسبه total_barnameh
        month_calc(12, 2, b.amaliat) AS total_barnameh,

        b.amaliat
    FROM public.bsc b
    WHERE b.amaliat = 10
    GROUP BY b.ostantitle, b.amaliat
)

-- section1
, section1_summary AS (
    SELECT
        ostantitle,
        amalkard,
        barnameh - amalkard AS dirkard,
        total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
        amaliat
    FROM bsc_summary
)

-- Calculate totals for section1
, section1_totals AS (
    SELECT
        'جمع کشوری' AS ostantitle,
        SUM(amalkard) AS amalkard,
        SUM(dirkard) AS dirkard,
        SUM(barnameh_diff) AS barnameh_diff,
        MAX(amaliat) AS amaliat
    FROM section1_summary
)

-- Combine results
(SELECT * FROM section1_totals)
UNION ALL
(SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab14Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            0 AS amalkard,
            month_calc(10, 2, 14, bsc) AS barnameh,
            month_calc(12, 2, 14, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 14
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab15Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            (SELECT 
				SUM(NULLIF(maabar_binam, '')::integer)
				FROM public.locations1 l
				WHERE l.ostantitle = b.ostantitle
			) AS amalkard,
            month_calc(10, 2, 15, bsc) AS barnameh,
            month_calc(12, 2, 15, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 15
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab16Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            (SELECT 
				SUM(NULLIF(zero_pelak, '')::integer)
				FROM public.locations1 l
				WHERE l.ostantitle = b.ostantitle
			) AS amalkard,
            month_calc(10, 2, 16, bsc) AS barnameh,
            month_calc(12, 2, 16, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 16
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab17Data = async () => {
  const sql = `WITH bsc_summary AS (
    SELECT
        b.ostantitle,
        
        -- محاسبه amalkard از locations1
        (SELECT 
            SUM(
                CASE WHEN tolid_qr THEN 1 ELSE 0 END
            )
         FROM public.locations1 l
         WHERE l.ostantitle = b.ostantitle
        ) AS amalkard,

        -- محاسبه barnameh از month_calc - بدون ستون bsc
        month_calc(10, 2, b.amaliat) AS barnameh,

        -- محاسبه total_barnameh
        month_calc(12, 2, b.amaliat) AS total_barnameh,

        b.amaliat
    FROM public.bsc b
    WHERE b.amaliat = 17
    GROUP BY b.ostantitle, b.amaliat
)

-- section1
, section1_summary AS (
    SELECT
        ostantitle,
        amalkard,
        barnameh - amalkard AS dirkard,
        total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
        amaliat
    FROM bsc_summary
)

-- Calculate totals for section1
, section1_totals AS (
    SELECT
        'جمع کشوری' AS ostantitle,
        SUM(amalkard) AS amalkard,
        SUM(dirkard) AS dirkard,
        SUM(barnameh_diff) AS barnameh_diff,
        MAX(amaliat) AS amaliat
    FROM section1_summary
)

-- Combine results
(SELECT * FROM section1_totals)
UNION ALL
(SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab18Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(3, 1, 18, bsc) AS amalkard,
            month_calc(10, 2, 18, bsc) AS barnameh,
            month_calc(12, 2, 18, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 18
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getWeeklyData = async (role, permission, username, ostan) => {
	  let whereClause = '';
  // Add a WHERE clause if the role is 4 or 1
  if(role === '4' || role === '1') {
	      // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions}) `;
  }
  
  // Add ostan filter if provided
  if (ostan) {
    whereClause = whereClause ? `${whereClause} AND ostantitle = '${ostan}'` : `WHERE ostantitle = '${ostan}'`;
  }
  const sql = `WITH RECURSIVE all_weeks AS (
    SELECT
        DATE_TRUNC('week', '2024-08-24'::date + INTERVAL '2 day') - INTERVAL '2 day' AS week_start,
        DATE_TRUNC('week', '2024-08-24'::date + INTERVAL '2 day') - INTERVAL '2 day' + INTERVAL '6 days' AS week_end
    UNION ALL
    SELECT
        week_start + INTERVAL '7 days',
        week_end + INTERVAL '7 days'
    FROM all_weeks
    WHERE week_end < CURRENT_DATE
),
weekly_counts AS (
    SELECT
        DATE_TRUNC('week', v.change_date + INTERVAL '2 day') - INTERVAL '2 day' AS week_start,
        COUNT(*) FILTER (WHERE v.changed_columns @> ARRAY['amaliate_meydani']) AS amaliate_meydani_count,
        COUNT(*) FILTER (WHERE v.changed_columns @> ARRAY['dadeh_amaei']) AS dadeh_amaei_count,
        COUNT(*) FILTER (WHERE v.changed_columns @> ARRAY['daryafte_naghsheh']) AS daryafte_naghsheh_count,
        SUM(CASE WHEN v.changed_columns @> ARRAY['amaliate_meydani'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_amaliyat_meydani_tedad_makan,
        SUM(CASE WHEN v.changed_columns @> ARRAY['dadeh_amaei'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_dadeh_amaei_tedad_makan,
        SUM(CASE WHEN v.changed_columns @> ARRAY['daryafte_naghsheh'] THEN l.tedad_geosakhteman::integer ELSE 0 END) AS sum_daryafte_naghshe_tedad_geosakhteman
    FROM public.users_change_log_view v
    JOIN public.locations1 l ON v.pop_id::bigint = l.population_point_id
	${whereClause}
    GROUP BY DATE_TRUNC('week', v.change_date + INTERVAL '2 day') - INTERVAL '2 day'
),
lateral_counts AS (
    SELECT
        aw.week_start,
        'amaliate_meydani' AS operation,
        COALESCE(wc.amaliate_meydani_count, 0) AS record_count,
        COALESCE(wc.sum_amaliyat_meydani_tedad_makan, 0) AS sum_of_rec
    FROM all_weeks aw
    LEFT JOIN weekly_counts wc ON aw.week_start = wc.week_start
    UNION ALL
    SELECT
        aw.week_start,
        'dadeh_amaei' AS operation,
        COALESCE(wc.dadeh_amaei_count, 0) AS record_count,
        COALESCE(wc.sum_dadeh_amaei_tedad_makan, 0) AS sum_of_rec
    FROM all_weeks aw
    LEFT JOIN weekly_counts wc ON aw.week_start = wc.week_start
    UNION ALL
    SELECT
        aw.week_start,
        'daryafte_naghsheh' AS operation,
        COALESCE(wc.daryafte_naghsheh_count, 0) AS record_count,
        COALESCE(wc.sum_daryafte_naghshe_tedad_geosakhteman, 0) AS sum_of_rec
    FROM all_weeks aw
    LEFT JOIN weekly_counts wc ON aw.week_start = wc.week_start
)
SELECT
    'از' || gregorian_to_jalali(week_start + INTERVAL '3 days') || ' تا ' || gregorian_to_jalali(week_start + INTERVAL '9 days') AS week_num,
    CONCAT(
        'هفته',
        ROW_NUMBER() OVER (PARTITION BY operation ORDER BY week_start),
        CASE
            WHEN ROW_NUMBER() OVER (PARTITION BY operation ORDER BY week_start) = 1 THEN ' (شهریور1403)'
            ELSE ''
        END
    ) AS week_label,
    record_count,
    operation,
    sum_of_rec,
    week_start
FROM lateral_counts
ORDER BY week_start, operation;
`;
  return await query(sql);
};
const getMonthlyData = async (role, permission, username, ostan) => {
	  let whereClause = '';
  // Add a WHERE clause if the role is 4 or 1
  if(role === '4' || role === '1') {
	      // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions}) `;
  }

  // Add ostan filter if provided
  if (ostan) {
    whereClause = whereClause ? `${whereClause} AND ostantitle = '${ostan}'` : `WHERE ostantitle = '${ostan}'`;
  }

  const sql = `WITH RECURSIVE all_months AS (
  SELECT
    '2024-08-22'::date AS month_start,
    '2024-09-21'::date AS month_end
  UNION ALL
  SELECT
    (month_start + INTERVAL '1 month')::date AS month_start,
    (month_end + INTERVAL '1 month')::date AS month_end
  FROM all_months
  WHERE month_end < CURRENT_DATE
),
monthly_counts AS (
  SELECT
    am.month_start,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['amaliate_meydani']) AS amaliate_meydani_count,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['dadeh_amaei']) AS dadeh_amaei_count,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['daryafte_naghsheh']) AS daryafte_naghsheh_count,

    SUM(CASE WHEN ucl.changed_columns @> ARRAY['amaliate_meydani'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_amaliyat_meydani_tedad_makan,
    SUM(CASE WHEN ucl.changed_columns @> ARRAY['dadeh_amaei'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_dadeh_amaei_tedad_makan,
    SUM(CASE WHEN ucl.changed_columns @> ARRAY['daryafte_naghsheh'] THEN l.tedad_geosakhteman::integer ELSE 0 END) AS sum_daryafte_naghshe_tedad_geosakhteman

  FROM public.users_change_log_view ucl
  JOIN public.locations1 l ON ucl.pop_id::bigint = l.population_point_id
  JOIN all_months am ON ucl.change_date >= am.month_start AND ucl.change_date <= am.month_end
  ${whereClause}
  GROUP BY am.month_start
),
lateral_counts AS (
  SELECT
    am.month_start,
    'amaliate_meydani' AS operation,
    COALESCE(mc.amaliate_meydani_count, 0) AS record_count,
    COALESCE(mc.sum_amaliyat_meydani_tedad_makan, 0) AS sum_of_rec
  FROM all_months am
  LEFT JOIN monthly_counts mc ON am.month_start = mc.month_start
  UNION ALL
  SELECT
    am.month_start,
    'dadeh_amaei' AS operation,
    COALESCE(mc.dadeh_amaei_count, 0) AS record_count,
    COALESCE(mc.sum_dadeh_amaei_tedad_makan, 0) AS sum_of_rec
  FROM all_months am
  LEFT JOIN monthly_counts mc ON am.month_start = mc.month_start
  UNION ALL
  SELECT
    am.month_start,
    'daryafte_naghsheh' AS operation,
    COALESCE(mc.daryafte_naghsheh_count, 0) AS record_count,
    COALESCE(mc.sum_daryafte_naghshe_tedad_geosakhteman, 0) AS sum_of_rec
  FROM all_months am
  LEFT JOIN monthly_counts mc ON am.month_start = mc.month_start
),

persian_month_names AS (
  SELECT
    month_start,
    record_count,
    operation,
    sum_of_rec,
    EXTRACT(MONTH FROM month_start) AS gregorian_month,
    EXTRACT(YEAR FROM month_start) AS gregorian_year,
    CASE
      WHEN EXTRACT(MONTH FROM month_start)::int < 3 THEN EXTRACT(YEAR FROM month_start)::int - 622
      ELSE EXTRACT(YEAR FROM month_start)::int - 621
    END AS persian_year
  FROM lateral_counts
)

SELECT
  CONCAT(
    CASE
      WHEN gregorian_month = 8 THEN 'شهریور'
      WHEN gregorian_month = 9 THEN 'مهر'
      WHEN gregorian_month = 10 THEN 'آبان'
      WHEN gregorian_month = 11 THEN 'آذر'
      WHEN gregorian_month = 12 THEN 'دی'
      WHEN gregorian_month = 1 THEN 'بهمن'
      WHEN gregorian_month = 2 THEN 'اسفند'
      WHEN gregorian_month = 3 THEN 'فروردین'
      WHEN gregorian_month = 4 THEN 'اردیبهشت'
      WHEN gregorian_month = 5 THEN 'خرداد'
      WHEN gregorian_month = 6 THEN 'تیر'
      WHEN gregorian_month = 7 THEN 'مرداد'
    END,
    ' ',
    persian_year
  ) AS week_num,
  record_count,
  operation,
  sum_of_rec
FROM persian_month_names
ORDER BY month_start, operation;`;
  return await query(sql);
};
const getQuarterlyData = async (role, permission, username, ostan) => {
	  let whereClause = '';
  // Add a WHERE clause if the role is 4 or 1
  if(role === '4' || role === '1') {
	      // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions}) `;
  }

  // Add ostan filter if provided
  if (ostan) {
    whereClause = whereClause ? `${whereClause} AND ostantitle = '${ostan}'` : `WHERE ostantitle = '${ostan}'`;
  }

  const sql = `WITH RECURSIVE all_quarters AS (
  -- Define the first quarter starting 2024-08-22
  SELECT
    '2024-08-22'::date AS quarter_start,
    '2024-11-19'::date AS quarter_end
  UNION ALL
  -- Recursively add quarters with a 3-month interval
  SELECT
    (quarter_start + INTERVAL '3 months')::date AS quarter_start,
    (quarter_end + INTERVAL '3 months')::date AS quarter_end
  FROM all_quarters
  WHERE quarter_end < CURRENT_DATE
),
quarterly_counts AS (
  -- Aggregate the counts and conditional sums by each custom quarter
  SELECT
    aq.quarter_start,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['amaliate_meydani']) AS amaliate_meydani_count,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['dadeh_amaei']) AS dadeh_amaei_count,
    COUNT(*) FILTER (WHERE ucl.changed_columns @> ARRAY['daryafte_naghsheh']) AS daryafte_naghsheh_count,

    -- Conditional sums based on operation type
    SUM(CASE WHEN ucl.changed_columns @> ARRAY['amaliate_meydani'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_amaliyat_meydani_tedad_makan,
    SUM(CASE WHEN ucl.changed_columns @> ARRAY['dadeh_amaei'] THEN l.tedad_makan::integer ELSE 0 END) AS sum_dadeh_amaei_tedad_makan,
    SUM(CASE WHEN ucl.changed_columns @> ARRAY['daryafte_naghsheh'] THEN l.tedad_geosakhteman::integer ELSE 0 END) AS sum_daryafte_naghshe_tedad_geosakhteman

  FROM public.users_change_log_view ucl
  JOIN public.locations1 l ON ucl.pop_id::bigint = l.population_point_id
  JOIN all_quarters aq ON ucl.change_date >= aq.quarter_start AND ucl.change_date <= aq.quarter_end
  ${whereClause}
  GROUP BY aq.quarter_start
),
lateral_counts AS (
  -- Create separate rows for each operation type in each quarter
  SELECT
    aq.quarter_start,
    'amaliate_meydani' AS operation,
    COALESCE(qc.amaliate_meydani_count, 0) AS record_count,
    COALESCE(qc.sum_amaliyat_meydani_tedad_makan, 0) AS sum_of_rec
  FROM all_quarters aq
  LEFT JOIN quarterly_counts qc ON aq.quarter_start = qc.quarter_start
  UNION ALL
  SELECT
    aq.quarter_start,
    'dadeh_amaei' AS operation,
    COALESCE(qc.dadeh_amaei_count, 0) AS record_count,
    COALESCE(qc.sum_dadeh_amaei_tedad_makan, 0) AS sum_of_rec
  FROM all_quarters aq
  LEFT JOIN quarterly_counts qc ON aq.quarter_start = qc.quarter_start
  UNION ALL
  SELECT
    aq.quarter_start,
    'daryafte_naghsheh' AS operation,
    COALESCE(qc.daryafte_naghsheh_count, 0) AS record_count,
    COALESCE(qc.sum_daryafte_naghshe_tedad_geosakhteman, 0) AS sum_of_rec
  FROM all_quarters aq
  LEFT JOIN quarterly_counts qc ON aq.quarter_start = qc.quarter_start
)
SELECT
  CONCAT('سه‌ماهه ', ROW_NUMBER() OVER (PARTITION BY operation ORDER BY quarter_start),
    CASE 
      WHEN ROW_NUMBER() OVER (PARTITION BY operation ORDER BY quarter_start) = 1 THEN ' (شهریور-آبان 1403)'
      ELSE ''
    END
  ) AS week_num,
  record_count,
  operation,
  sum_of_rec
FROM lateral_counts
ORDER BY week_num, operation;`;
  return await query(sql);
};

const getInteroperability = async (eghdamat) => {
  const sql = `SELECT kargrouh_barnameh1.year AS "سال", kargrouh_barnameh1.amaliat AS "عملیات", kargrouh_barnameh1.eghdamat AS "اقدامات", kargrouh_barnameh1.amalkard AS "عملکرد", kargrouh_barnameh1.tahaghog AS "تحقق", kargrouh_barnameh1.vahede_sanjesh AS "واحد سنجش", kargrouh_barnameh1.motevali AS "متولی", kargrouh_barnameh1.dastgah AS "دستگاه", GREATEST((SELECT month_cal(13, kargrouh_barnameh1.id)) - kargrouh_barnameh1.amalkard, 0) AS "دیرکرد", ((farvardin + ordibehesht + khordad + tir + mordad + shahrivar + mehr + aban + azar + dey + bahman + esfand) - GREATEST((SELECT month_cal(13, kargrouh_barnameh1.id)) - kargrouh_barnameh1.amalkard, 0) - kargrouh_barnameh1.amalkard) AS "تفاضل برنامه" FROM kargrouh_barnameh1 WHERE eghdamat LIKE '${eghdamat}' ORDER BY priority;`;
  return await query(sql);
};
const getPostalCodeRequest = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  // Add a WHERE clause if the role is 4 or 1
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE "استان" IN (${conditions}) `;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }

  const sql = `WITH calculated_columns AS (
  SELECT
    ostantitle AS "استان",
    under72 AS "رسیدگی شده زیر 72 ساعت",
    over72 AS "رسیدگی شده بالای 72 ساعت",
    monthbalance AS "مانده ماه جاری",
    sixmonthbalance AS "مانده ماههای قبل (شش ماهه)",
    currentmontharch AS "آرشیو مورد تایید ماه جاری",
    sixmontharch AS "آرشیو مورد تایید ماههای قبل",
    (over72 + under72 + monthbalance) AS "مجموع درخواست های ماه جاری",
    ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "درصد رسیدگی به موقع به درخواست ها",
    CASE
      WHEN ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) < 50 THEN 0
      WHEN ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) > 97 THEN 3
      ELSE (((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) - 50) * 6 / 47
    END AS "امتیاز شاخص 1 (3 امتیاز)",
    ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "درصد رسیدگی موفق به درخواست ها",
    CASE
      WHEN ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) < 80 THEN 0
      WHEN ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) > 100 THEN 2
      ELSE (((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) - 80) * 10 / 100
    END AS "امتیاز شاخص 2 (2 امتیاز)",
    ((monthbalance - currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "درصد بلاتکلیف ماه جاری",
    ((sixmonthbalance - sixmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "درصد بلاتکیف تجمعی (شش ماهه)"
  FROM
    public.postalcode_request
),
final_calculations AS (
  SELECT
    *,
    CASE
      WHEN "درصد بلاتکلیف ماه جاری" > 5 THEN -1
      ELSE "درصد بلاتکلیف ماه جاری" * (-0.5)
    END AS "امتیاز شاخص 3 (1-امتیاز)",
    CASE
      WHEN "درصد بلاتکیف تجمعی (شش ماهه)" > 10 THEN -2
      ELSE "درصد بلاتکیف تجمعی (شش ماهه)" * (-0.5)
    END AS "امتیاز شاخص 4 (2- امتیاز)"
  FROM
    calculated_columns
)
SELECT
  "استان",
  "رسیدگی شده زیر 72 ساعت",
  "رسیدگی شده بالای 72 ساعت",
  "مانده ماه جاری",
  "مانده ماههای قبل (شش ماهه)",
  "آرشیو مورد تایید ماه جاری",
  "آرشیو مورد تایید ماههای قبل",
  "مجموع درخواست های ماه جاری",
  ROUND("درصد رسیدگی به موقع به درخواست ها", 2) AS "درصد رسیدگی به موقع به درخواست ها",
  ROUND("امتیاز شاخص 1 (3 امتیاز)", 2) AS "امتیاز شاخص 1 (3 امتیاز)",
  ROUND("درصد رسیدگی موفق به درخواست ها", 2) AS "درصد رسیدگی موفق به درخواست ها",
  ROUND("امتیاز شاخص 2 (2 امتیاز)", 2) AS "امتیاز شاخص 2 (2 امتیاز)",
  ROUND("درصد بلاتکلیف ماه جاری", 2) AS "درصد بلاتکلیف ماه جاری",
  ROUND("امتیاز شاخص 3 (1-امتیاز)", 2) AS "امتیاز شاخص 3 (1-امتیاز)",
  ROUND("درصد بلاتکیف تجمعی (شش ماهه)", 2) AS "درصد بلاتکیف تجمعی (شش ماهه)",
  ROUND("امتیاز شاخص 4 (2- امتیاز)", 2) AS "امتیاز شاخص 4 (2- امتیاز)",
  CASE
    WHEN ROUND("امتیاز شاخص 1 (3 امتیاز)" + "امتیاز شاخص 2 (2 امتیاز)" + "امتیاز شاخص 3 (1-امتیاز)" + "امتیاز شاخص 4 (2- امتیاز)", 2) < 0 THEN 0
    ELSE ROUND("امتیاز شاخص 1 (3 امتیاز)" + "امتیاز شاخص 2 (2 امتیاز)" + "امتیاز شاخص 3 (1-امتیاز)" + "امتیاز شاخص 4 (2- امتیاز)", 2)
  END AS "جمع امتیاز"
FROM
  final_calculations
  ${whereClause}
  ORDER BY "استان"`;
  return await query(sql);
};
// Update roosta data
const updateRoostaData = async (modifiedRecords, role, username) => {
  const client = await pool.connect(); // Now pool is defined
  try {
    await client.query('BEGIN'); // Start a transaction

    for (const record of modifiedRecords) {
      const { population_point_id, shenaseh_melli, amaliate_meydani_user_fullname, dadeh_amaei_user_fullname, eslah_naghsheh, geocode, tolid_qr, pelak_talfighi } = record;

      // Determine the value of amaliate_meydani based on amaliate_meydani_user_fullname
      const amaliate_meydani = amaliate_meydani_user_fullname !== null;
      const dadeh_amaei = dadeh_amaei_user_fullname !== null;

      // Update the main table
      const updateQuery = `
        UPDATE public.locations1
        SET 
          shenaseh_melli = $1,
          amaliate_meydani_user_fullname = $2::TEXT,
          dadeh_amaei_user_fullname = $3::TEXT,
          eslah_naghsheh = $4,
          daryafte_naghsheh = $5,
          tolid_qr = $6,
          pelak_talfighi = $7
        WHERE population_point_id = $8;
      `;
	  console.log([shenaseh_melli, amaliate_meydani_user_fullname, dadeh_amaei_user_fullname, eslah_naghsheh, geocode, tolid_qr, pelak_talfighi, population_point_id]);
      await client.query(updateQuery, [shenaseh_melli, amaliate_meydani_user_fullname, dadeh_amaei_user_fullname, eslah_naghsheh, geocode, tolid_qr, pelak_talfighi, population_point_id]);

      // Insert the changes into the changes table
      const insertQuery = `
        INSERT INTO roosta_changes (
          population_point_id, 
          shenaseh_melli, 
          amaliate_meydani, 
          dadeh_amaei,
          eslah_naghsheh,
          daryafte_naghsheh,
          tolid_qr,
          pelak_talfighi,
          user_id,
          changed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());
      `;
      await client.query(insertQuery, [
        population_point_id,
        shenaseh_melli,
        amaliate_meydani, // Use the calculated value here
        dadeh_amaei,
        eslah_naghsheh,
        geocode,
        tolid_qr,
        pelak_talfighi,
        username
      ]);

      // Determine which fields are true and build the columns array
      if (role === '4') {
        const columns = [];
        if (amaliate_meydani) columns.push('amaliate_meydani');
        if (dadeh_amaei) columns.push('dadeh_amaei');
        if (geocode) columns.push('daryafte_naghsheh');

        const change_log_insert = `
          INSERT INTO change_log1 (pop_id, user_id, columns, date)
          VALUES ($1, $2, $3, NOW());
        `;
        await client.query(change_log_insert, [population_point_id, username, columns]);
      }
    }

    await client.query('COMMIT'); // Commit the transaction
    return { message: 'Roosta data updated and changes logged successfully!' };
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback the transaction in case of error
    throw error;
  } finally {
    client.release();
  }
};
const getBests = async (operator) => {
  const sql = `WITH query1 AS (
  WITH RECURSIVE all_weeks AS (
    SELECT 
      DATE_TRUNC('week', '2024-08-24'::date + INTERVAL '2 day') - INTERVAL '2 day' AS week_start,
      DATE_TRUNC('week', '2024-08-24'::date + INTERVAL '2 day') - INTERVAL '2 day' + INTERVAL '6 days' AS week_end
    UNION ALL
    SELECT 
      week_start + INTERVAL '7 days',
      week_end + INTERVAL '7 days'
    FROM all_weeks
    WHERE week_end < CURRENT_DATE
  ),
  weekly_counts AS (
    SELECT 
      DATE_TRUNC('week', cl.date + INTERVAL '2 day') - INTERVAL '2 day' AS week_start,
      COUNT(*) FILTER (WHERE cl.columns @> ARRAY['amaliate_meydani']) AS amaliate_meydani_count,
      COUNT(*) FILTER (WHERE cl.columns @> ARRAY['dadeh_amaei']) AS dadeh_amaei_count,
      COUNT(*) FILTER (WHERE cl.columns @> ARRAY['daryafte_naghsheh']) AS daryafte_naghsheh_count
    FROM public.change_log cl
    JOIN public.locations1 l ON cl.pop_id::bigint = l.population_point_id
    GROUP BY DATE_TRUNC('week', cl.date + INTERVAL '2 day') - INTERVAL '2 day'
  ),
  week_labels AS (
    SELECT 
      week_start,
      CONCAT(
        'هفته', 
        ROW_NUMBER() OVER (ORDER BY week_start), 
        CASE 
          WHEN ROW_NUMBER() OVER (ORDER BY week_start) = 1 THEN ' (شهریور1403)'
          ELSE ''
        END
      ) AS week_label
    FROM all_weeks
  ),
  max_week AS (
    SELECT MAX(CAST(SUBSTRING(week_label FROM 'هفته(\\d+)') AS INTEGER)) AS max_week_number
    FROM week_labels
    WHERE EXISTS (
      SELECT 1
      FROM change_log cl
      JOIN public.locations1 l ON cl.pop_id::bigint = l.population_point_id
      WHERE DATE_TRUNC('week', cl.date + INTERVAL '2 day') - INTERVAL '2 day' = week_labels.week_start
      AND '${operator}' = ANY(cl.columns)
    )
  )
  SELECT 
    l.ostantitle,
    COUNT(*) AS count
  FROM change_log cl
  JOIN public.locations1 l ON cl.pop_id::bigint = l.population_point_id
  JOIN week_labels wl ON DATE_TRUNC('week', cl.date + INTERVAL '2 day') - INTERVAL '2 day' = wl.week_start
  CROSS JOIN max_week mw
  WHERE '${operator}' = ANY(cl.columns)
  AND CAST(SUBSTRING(wl.week_label FROM 'هفته(\\d+)') AS INTEGER) = mw.max_week_number - 1
  GROUP BY l.ostantitle
),
query2 AS (
  SELECT ostantitle, count(*) AS total_count
  FROM public.locations1
  GROUP BY ostantitle
),
avg_work_done AS (
  SELECT AVG(count) AS avg_count
  FROM query1
)
SELECT 
  COALESCE(q1.ostantitle, q2.ostantitle) AS ostantitle,
  CASE 
    WHEN q2.total_count = 0 OR avg.avg_count = 0 THEN NULL
    ELSE ROUND(
      CAST(COALESCE(q1.count, 0) AS NUMERIC) / q2.total_count *
      COALESCE(q1.count, 0) / avg.avg_count,
      4
    )
  END AS efficiency_index
FROM query1 q1
FULL OUTER JOIN query2 q2 ON q1.ostantitle = q2.ostantitle
CROSS JOIN avg_work_done avg
ORDER BY efficiency_index DESC NULLS LAST
LIMIT 3;`;
  return await query(sql);
};

const authenticateUser = async (username, password) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userQuery = await client.query(
      'SELECT * FROM users1 WHERE username = $1 AND is_blacklisted = false',
      [username]
    );
    const user = userQuery.rows[0];

    if (!user) {
      throw new Error('No user found or user is blacklisted!');
    }

    if (password !== user.password_hash) {
      throw new Error('Invalid username or password');
    }

    await client.query('UPDATE users1 SET last_login = NOW() WHERE username = $1', [username]);
    await client.query('COMMIT');

    // Convert the timestamp to Tehran time zone
    const tehranTime = new Date(user.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Tehran' });
    user.timestamp = tehranTime;

    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.user_id,
      username: user.username,
      role: user.role,
      permission: user.permission,
      timestamp: user.timestamp,
    },
    JWT_SECRET,
    { expiresIn: '720m' }
  );
};
const SetTimestamp = async (username) => {
	const sql = `UPDATE public.users1 SET timestamp = NOW() WHERE username = '${username}';`;
	return await query(sql);
}


const storeToken = async (token, userId) => {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO tokens (token_id, user_id, expires_at) VALUES ($1, $2, $3)`,
      [token, userId, new Date(Date.now() + 720 * 60 * 1000)] // 30 minutes from now
    );
  } finally {
    client.release();
  }
};
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user information to the request object
    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      permission: decoded.permission,
      timestamp: decoded.timestamp,
    };

    // Check if the token is blacklisted
    const blacklistedToken = await checkBlacklistedToken(token);

    if (blacklistedToken) {
      return res.status(403).json({ error: 'Token is blacklisted' });
    }

    // Log user information for debugging
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};

const checkBlacklistedToken = async (token) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tokens WHERE token_id = $1 AND is_blacklisted = TRUE`,
      [token]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking blacklisted token:', err);
    throw err;
  }
};
const blacklistToken = async (token) => {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE tokens SET is_blacklisted = TRUE WHERE token_id = $1`, [token]);
  } catch (err) {
    console.error('Error blacklisting token:', err);
    throw err;
  } finally {
    client.release();
  }
};

const getOstanNames = async (role, permission) => {
  let whereClause = '';
  // Add a WHERE clause if the role is 4 or 1
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
  }
const sql = `SELECT ostantitle FROM public.locations1 ${whereClause} GROUP BY ostantitle ORDER BY ostantitle;`;
  return await query(sql);
};
const getOstanUsers = async (role, permission) => {
    let whereClause = '';
    if (role === '4') {
        const conditions = permission.map((region) => `'${region}'`).join(', ');
        whereClause = `WHERE ostantitle IN (${conditions}) AND ((type = 2 OR type = 3) AND user_id != '0') OR type = 4`;
    }

    const sql = `
        SELECT user_id, CONCAT(firstname, ' ', lastname) AS full_name 
        FROM public.record_users 
        ${whereClause}
        ORDER BY ostantitle;
    `;
    return await query(sql);
};
const getDadehAmaeiUsers = async (role, permission) => {
    let whereClause = '';
    if (role === '4') {
        const conditions = permission.map((region) => `'${region}'`).join(', ');
        whereClause = `WHERE ostantitle IN (${conditions}) AND ((type = 2 OR type = 3) AND user_id != '0') OR type = 4`;
    }

    const sql = `
        SELECT user_id, CONCAT(firstname, ' ', lastname) AS full_name 
        FROM public.record_users 
        ${whereClause}
        ORDER BY ostantitle;
    `;
    return await query(sql);
};
module.exports = { getMapStatusData, getCityLocationsData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getShahrData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData, getPieMap, getBSCTab1Data, getBSCTab2Data, getBSCTab3Data, getBSCTab4Data, getBSCTab5Data, getBSCTab6Data, getBSCTab7Data, getBSCTab8Data, getBSCTab9Data, getBSCTab10Data, getBSCTab11Data, getBSCTab12Data, getBSCTab13Data, getBSCTab14Data, getBSCTab15Data, getBSCTab16Data, getBSCTab17Data, getBSCTab18Data, getPostalCodeRequest, updateRoostaData, storeToken, generateToken, authenticateUser, authenticateToken, blacklistToken, getGnafIndexData, changePassword, getInteroperability, getNotifications, getUsernameById, SetTimestamp, getMapCount, getUpdateCount, getDadehCount, getGeoCount, getRadarData, getWeeklyData, getMonthlyData, getQuarterlyData, getBests, getProgressData, getOstanUsers, getDadehAmaeiUsers };
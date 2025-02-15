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
// Function to construct and execute the SQL query
const getQueryData = async (selectedItems, role, permission) => {
    let whereCondition = '';

    // Add WHERE condition if selectedItems is provided
    if (selectedItems && selectedItems.length > 0) {
        const formattedItems = selectedItems.map(item => `'${item}'`).join(', ');
        whereCondition = `AND ostantitle IN (${formattedItems})`;
    }

    const sql = `SELECT 
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
    date,
    tedad_geocode_makan,
    tedad_makan_jadid,
    tedad_sakhteman,
    tedad_makan,
    tedad_geosakhteman,
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
ORDER BY 
    ostantitle, 
    shahrestantitle, 
    zonetitle, 
    dehestantitle, 
    locationname;`;

    return await query(sql); // Execute the query and return the results
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
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count
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
  const sql = `SELECT ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname, population_point_id, shenaseh_melli, adam_paziresh AS bonyad_maskan
, niazmande_eslah AS sayer_manabe, arseh_ayan AS tarsim, tedad_parcel, amaliate_meydani, dadeh_amaei, eslah_naghsheh, daryafte_naghsheh AS geocode
, adam_tayid, tayid_va_bargozari, pdf AS mokhtasat_rousta, ersal_setad AS mahdoudeh_rousta, tolid_qr, pelak_talfighi FROM public.locations1
WHERE ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3 AND dehestantitle = $4;`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle, dehestantitle]);
};
const getBSCTab1Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 1, bsc) AS amalkard,
            month_calc(12, 2, 1, bsc) AS barnameh,
            month_calc(12, 2, 1, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 1
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
const getBSCTab2Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 2, bsc) AS amalkard,
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
            month_calc(12, 1, 3, bsc) AS amalkard,
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
            month_calc(12, 1, 4, bsc) AS amalkard,
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
            month_calc(12, 1, 5, bsc) AS amalkard,
            month_calc(12, 2, 5, bsc) AS barnameh,
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
const getInteroperability = async (eghdamat) => {
  const sql = `SELECT kargrouh_barnameh1.year, kargrouh_barnameh1.amaliat, kargrouh_barnameh1.eghdamat, kargrouh_barnameh1.amalkard, kargrouh_barnameh1.tahaghog, kargrouh_barnameh1.vahede_sanjesh, kargrouh_barnameh1.motevali, kargrouh_barnameh1.dastgah, GREATEST((SELECT month_cal(13, kargrouh_barnameh1.id)) - kargrouh_barnameh1.amalkard, 0) AS dirkard, ((farvardin + ordibehesht + khordad + tir + mordad + shahrivar + mehr + aban + azar + dey + bahman + esfand) - GREATEST((SELECT month_cal(13, kargrouh_barnameh1.id)) - kargrouh_barnameh1.amalkard, 0) - kargrouh_barnameh1.amalkard) AS barnameh_diff FROM kargrouh_barnameh1 WHERE eghdamat LIKE '${eghdamat}' ORDER BY priority;`;
  return await query(sql);
};
const getPostalCodeRequest = async (role, permission) => {
  let whereClause = '';
  let location = 'ostantitle';
  // Add a WHERE clause if the role is 4 or 1
  if (role === '4' || role === '1') {
    // Convert the permission array into a list of SQL conditions
    const conditions = permission.map((region) => `'${region}'`).join(', ');
    whereClause = `WHERE ostantitle IN (${conditions})`;
	location = role === '4' ? 'shahrestantitle' : (role === '1' ? 'ostantitle' : undefined);
  }

  const sql = `WITH calculated_columns AS (
  SELECT
    ostantitle AS "استان",
    under72 AS "زیر ۷۲ ساعت",
    over72 AS "بالای ۷۲ ساعت",
    monthbalance AS "مانده ماه",
    sixmonthbalance AS "مانده ۶ ماه",
    currentmontharch AS "عملکرد ماه جاری",
    sixmontharch AS "عملکرد ۶ ماه",
    (over72 + under72 + monthbalance) AS "ستون ح",
    ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "ستون جدید",
    CASE
      WHEN ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) < 50 THEN 0
      WHEN ((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) > 97 THEN 3
      ELSE (((under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) - 50) * 6 / 47
    END AS "فرمول ۱",
    ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "فرمول ۲",
    CASE
      WHEN ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) < 80 THEN 0
      WHEN ((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) > 100 THEN 2
      ELSE (((over72 + under72 + currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) - 80) * 10 / 100
    END AS "فرمول ۳",
    ((monthbalance - currentmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "فرمول ۴",
    ((sixmonthbalance - sixmontharch) * 100.0 / NULLIF((over72 + under72 + monthbalance), 0)) AS "فرمول ۶"
  FROM
    public.postalcode_request
),
final_calculations AS (
  SELECT
    *,
    CASE
      WHEN "فرمول ۴" > 5 THEN -1
      ELSE "فرمول ۴" * (-0.5)
    END AS "فرمول ۵",
    CASE
      WHEN "فرمول ۶" > 10 THEN -2
      ELSE "فرمول ۶" * (-0.5)
    END AS "فرمول ۷"
  FROM
    calculated_columns
)
SELECT
  "استان",
  "زیر ۷۲ ساعت",
  "بالای ۷۲ ساعت",
  "مانده ماه",
  "مانده ۶ ماه",
  "عملکرد ماه جاری",
  "عملکرد ۶ ماه",
  "ستون ح",
  ROUND("ستون جدید", 2) AS "ستون جدید",
  ROUND("فرمول ۱", 2) AS "فرمول ۱",
  ROUND("فرمول ۲", 2) AS "فرمول ۲",
  ROUND("فرمول ۳", 2) AS "فرمول ۳",
  ROUND("فرمول ۴", 2) AS "فرمول ۴",
  ROUND("فرمول ۵", 2) AS "فرمول ۵",
  ROUND("فرمول ۶", 2) AS "فرمول ۶",
  ROUND("فرمول ۷", 2) AS "فرمول ۷",
  CASE
    WHEN ROUND("فرمول ۱" + "فرمول ۳" + "فرمول ۵" + "فرمول ۷", 2) < 0 THEN 0
    ELSE ROUND("فرمول ۱" + "فرمول ۳" + "فرمول ۵" + "فرمول ۷", 2)
  END AS "فرمول ۸"
FROM
  final_calculations
  ${whereClause}`;
  return await query(sql);
};
// Update roosta data
const updateRoostaData = async (modifiedRecords) => {
  const client = await pool.connect(); // Now pool is defined
  try {
    await client.query('BEGIN'); // Start a transaction

    for (const record of modifiedRecords) {
      const { population_point_id, shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode } = record;

      // Update the main table
      const updateQuery = `
        UPDATE public.locations1
        SET 
          shenaseh_melli = $1,
          amaliate_meydani = $2,
          dadeh_amaei = $3,
          daryafte_naghsheh = $4
        WHERE population_point_id = $5;
      `;
      await client.query(updateQuery, [shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode, population_point_id]);

      // Insert the changes into the changes table
      const insertQuery = `
        INSERT INTO roosta_changes (
          population_point_id, 
          shenaseh_melli, 
          amaliate_meydani, 
          dadeh_amaei, 
          daryafte_naghsheh, 
          changed_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW());
      `;
      await client.query(insertQuery, [population_point_id, shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode]);
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
      userId: decoded.sub, // Use `sub` instead of `user_id`
	  username: decoded.username,
      role: decoded.role,
      permission: decoded.permission,
	  timestamp: decoded.timestamp,
    };

    // Check if the token is blacklisted
    const blacklistedToken = await pool.query(
      `SELECT * FROM tokens WHERE token_id = $1 AND is_blacklisted = TRUE`,
      [token]
    );

    if (blacklistedToken.rows.length > 0) {
      return res.status(403).json({ error: 'Token is blacklisted' });
    }

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(403).json({ error: 'Invalid token' });
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
module.exports = { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData, getPieMap, getBSCTab1Data, getBSCTab2Data, getBSCTab3Data, getBSCTab4Data, getBSCTab5Data, getPostalCodeRequest, updateRoostaData, storeToken, generateToken, authenticateUser, authenticateToken, blacklistToken, getGnafIndexData, changePassword, getInteroperability, getNotifications, getUsernameById, SetTimestamp, getMapCount, getUpdateCount, getDadehCount, getGeoCount, getRadarData };
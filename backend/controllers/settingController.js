const Setting = require('../models/Setting');

const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find({});
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json({ success: true, data: settingsMap });
  } catch (error) { next(error); }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Setting updated.', data: setting });
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSetting };

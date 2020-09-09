export default (req, res) => {
  let host = req.get("host");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  res
    .status(200)
    .send(
      `Sitemap: https://${host}/sitemap_index.xml\n\nUser-agent: *\nDisallow: /wp-admin/`
    )
    .end();
};

# Webhooked V2

Webhooked is a webhook inspection tool that I made to test personal projects. This is a very common class of tool, with
`webhook.site` likely being the most well known variant.

Although I wasn't that happy with having to generate ephemeral URLs on the free version, and I could self-host it but,
it'd be overkill.

So I did the sane thing and wrote my own. And hey~ it's good enough :)

- A typescript re-write of my project [Webhooked](https://github.com/msmur/webhooked), which I initially wrote in
  Python.
- I wasn't having all that much fun working on it, so I decided to rewrite it in typescript and use some tools I haven't
  tried before
- Namely, Fastify (which is wildly different from Express ;o) and Kysely

The `html/css/js` code was mostly written with the help of LLMs - given that I'm not the most proficient in frontend
work - and I just wanted something that looked good, and I wanted it fast.

The project is meant to be self-hosted, instructions on that will follow soon!

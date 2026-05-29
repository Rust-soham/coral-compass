![](https://www.youtube.com/watch?v=gWfm2jTaRJ4)

Don't just hear about Coral - build with us! Join Matt (CEO) and James (CTO) to set sail on the Pirates of the Coral-bean Hackathon. We'll install Coral on a fresh machine, connect multiple data sources, and ship a working agent live - then walk through everything you need to win this week's treasure. Q&A throughout.  
  
Register for the hackathon: https://www.wemakedevs.org/hackathons/coral

## Transcript

**0:00** · \[music\] \[music\] \[music\] \[music\] Hello.

**0:32** · Welcome everyone to the kickoff stream for Pirates of the Caribbean hackathon. I love these names. They're \[snorts\] part of our team.

**0:42** · We are joined by James and Matt from Team Coral.

**0:47** · And I'm going to give you a little bit of a background about the hackathon before I hand it over to the Coral team to teach you all about the project, how do you get started, what to do with it, and answer your questions live as well. So, if you have any questions, be that about the hackathon or about Coral, anything really, you can send it in the live chat and we'll answer those in the end.

**1:10** · And if you haven't joined the Coral community, the Discord server, make sure you join that uh as well.

**1:21** · Cool. So, this is the Well, this is the Vimage website.

**1:24** · I'm just going to show you. Here we go.

**1:27** · So, that's the That's the main page.

**1:29** · The reason I'm showing this is because literally everything you need is on this page. Sometimes we get a lot of questions that are repetitive, you know.

**1:37** · This is This is it. This has everything.

**1:39** · I've worked so hard on this page, so please use this page. It also has rules.

**1:44** · Obviously, I won't go through those because you can just read those. Don't want to be Don't want to bore you.

**1:50** · Resources, this is an important bit for you to get started with the project. If you're new to the project or if If registered yet, you can still register I mean, till the end of the week. I mean, the hackathon ends on Sunday.

**2:01** · So, really up to you. Whenever you want to submit a project, that's up to you.

**2:06** · Um but all the resources can be found here. The very important link is the Coral Discord because this is where you'll be asking your questions and meeting with other people.

**2:14** · Um so, I'll update this website with all the if there's any changes, I'll make sure I update that, but this is the main website you should check. You can take part in um as a solo person or you can take part in teams of four. My recommendation is teams of four or less cuz when you are taking part in team, it's much more fun and engaging.

**2:35** · Um we're giving away a lot of prizes, so I'm just going to share a bit about the tracks and how you can how you can win.

**2:41** · So, we have two tracks where first one is you can build an enterprise agent um that retrieves data from multiple sources. There's also a side track where if a source does not exist yet, let's say a Gmail or something else, you can uh you can create a new source spec. Um the guide for that is also given this link. If you just click on it, you will go through the There you go.

**3:05** · So, that's the resource for how to create a custom spec.

**3:08** · Anyway, um so, that's uh track number one. Uh here are some examples for you to follow. Now, these are just examples. It doesn't have to be like this. Someone was asking, do I have to pick between these five? No.

**3:23** · You can build anything. The theme is open-ended. Uh it doesn't have to be these five, but it has to be like an agent that retrieves data from multiple sources using Coral.

**3:32** · Um but you can build anything.

**3:34** · The second one is you build a personal agent.

**3:37** · Um so, basically, any task that you use like daily, you want to be more productive, you can connect the various tools that you use every day, let Coral handle the rest. Again, these are also just examples. You don't have to pick between these five. You can do anything, okay? So, it's not it's not like it's tied to this. So, that's one thing I wanted to share.

**3:57** · Really cool prizes, MacBooks, iPads. Uh someone asked uh how do you split a MacBook between a team? You don't have to. We will ship a an individual prize to every team member.

**4:07** · So, if you are a team of four, we'll give all the four people a MacBook. So, don't worry about that.

**4:12** · Um lastly, um I would like to wrap up with just saying that we are doing um some giveaways as well. So, if you share on socials, um let's say on the Coral Discord, how I Coral, um you share your journey with screenshots and a little write-up, and you share it on LinkedIn or Twitter, and tag Coral, 50 people uh would get a Cloud Max uh voucher.

**4:36** · And we will be also highlighting you on my channel where we are live right now.

**4:41** · Um and uh this one I already mentioned, and uh if you create a how-to build guide.

**4:47** · So, by the way, if you write a blog on your journey, uh how you used uh let's say Coral to build something, we will be selecting the best guides and giving them a Keychron keyboard.

**4:59** · Um if you don't know, Keychrons are quite amazing keyboards. Uh we have given plenty in the past, and those have been very popular. So, I highly recommend it. So, as you can see, there's a lot to win for everyone.

**5:11** · Even if you, let's say, don't win the main prize, there's a lot to win like keyboards and other things.

**5:18** · Now, uh to the sponsor, uh Coral, an open-source project very close to 5,000 GitHub stars. So, if you are new to the project, I would recommend going to this website, going to the documentation, the GitHub, giving it a star, and checking out the documentation, um and joining the Discord server.

**5:37** · And uh now I'm going to hand it over to Matt and James, who are going to basically tell you all how to get started. And um yeah, over to you, Matt. Maybe you want to give yourself a quick intro and then James and then we can uh kick it off.

**5:56** · Thank you, Kunal. And um and thank you, everyone. Um you know, we're so grateful for folks tuning in um and watching this uh and participating in the hackathon.

**6:07** · You know, it's um it's cool to have this degree of interest in what we're building. Um and we hope you find it useful experience. Um we have already um been been really blown away by the ideas and enthusiasm that's coming through in the Discord for the project. So, we can't wait to see what you build over the next few days.

**6:26** · Um I'm going to share some uh some some slides about uh essentially sort of Coral as a product um sort of how we think about it um some of the different sort of motivations in building it. Um and also uh it'll sort of help you to understand where we're taking the project next. Um and then uh after me, James, uh my co-founder, he's going to show you a demo of Coral so you can see a bit of it live in action. Um I know many of you won't have had a chance to try it yet.

**6:58** · So, hopefully that sort of helps to make it uh feel real and and and give you uh sort of what you need to start getting started. Um and James and I um we have a a team of folks working on Coral. We are based in uh the UK and Europe. And um we sort of first, before I jump into the slides, I'll explain we we arrived at this opportunity because we started building agents.

**7:25** · We were in particular uh building a um uh building a a software reliability agent. Um and what we found was that uh one of the things that really made a difference to its performance and efficiency was how well it could retrieve data from different data sources.

**7:45** · Um and we were sort of so excited about uh the technique of using um an SQL interface as a layer between the agent and the data. Um and the sort of the early um positive experiences we had with that technique that we wanted to really double down on it. And so that was the background to how we started working on Coral.

**8:07** · Um and I'm going to show you some more about the the the product plans now. Um so let me share my screen.

**8:26** · Okay. Maybe I'll start by explaining um why Coral. So hopefully you can all see my screen and um and hear me.

**8:43** · First, it's called Coral because um you know, in the sea Coral is this living substrate that helps to support uh other life. Helps uh you know, life just sort of flourish. And that's what we want Coral to be for agents that um it's uh it's meant to be this this layer that helps people to build upon it. And um one of the reasons for doing this hackathon and starting with an open-source product is that um we're really building for developers and builders.

**9:14** · And we want people to go and you know, not only help us extend the product, but also to build amazing uh things on top of it and with it. Um as you know, it's this open-source query runtime for agents.

**9:29** · It helps agents to be able to retrieve data um much more efficiently, so at lower token cost, but also uh more accurately, and it also enables you to um often sort of put this layer between the agents and the data source credentials, as well.

**9:50** · Um So, the when we were building agents ourselves, what we found was that the the sort of the status quo of agent data retrieval was was really you could think of it in these three areas. There's people building direct MCP tools in particular, and you'd often start adding more and more and more as you wanted your agent to utilize different data sources.

**10:17** · Um sometimes you could add an MCP tool gateway that would help to aggregate up some of those.

**10:24** · Um more recently, there's been code mode emerge, which helps you to be able to do some of the initial sort of tool search, and then um parsing of the results from the APIs with code. However, that the challenge with all three of these is that you still need the agent to go through a lot of um query planning, where it's discovering and then sequencing a whole lot of calls to

**10:57** · paginated APIs for each of these different data sources that it's interacting with. And so, you get um some inefficiency because you're relying on the agent and the LLM to do so much, um and also sometimes uh you you that leads to more timeouts, as well, which you sort of see in inaccuracies and sometimes null results.

**11:20** · Um So, where does Coral fit in? Well, it's this it's this query runtime that sits between the agents and your data sources.

**11:30** · Um it works with any agent and it uh handles a lot of the repeated heavy lifting with each of the data sources.

**11:39** · And so, things like pagination handles the rate limits, it sort of retrieves back schema information.

**11:51** · And then when the results from the from the APIs come in, Coral also prepares it. So, what it hands over to the LLM is a cleaner tabular data format. And so, in this case, it's making the agent more efficient both by enabling it to make fewer queries and more precise queries, but also enabling the data that goes back to the agent to be more precise as well.

**12:23** · Um There's an example here. This was one of many examples we've used in our benchmarking.

**12:32** · And in this case, it's not even multiple data sources, just a single data source where we were using Claude code with Linear, the issue project management software.

**12:45** · We asked Claude, "What percentage of issues have story point estimates? Break it down by team and priority."

**12:52** · You can imagine, you know, many of you asking an agent a question like this in your day-to-day work. Um, when you asked Claude code this when it's connected directly to the Linear MCP, it does a large number of tool calls.

**13:07** · In our benchmarking case, 36 different tool calls to work out where's the data, how should I call it call it, go through the paginated API, work out pass through the results because it pulls back all of the issues at once, and it ends up costing 71 cents on a metered Anthropic bill.

**13:28** · Um the same linear data source with Claude code, same model, but via Coral to do the query, fewer two tool calls, less data into the token window, and it's a much lower cost. And so this stuff stacks up. You can imagine, you know, lots of even individuals are doing a ton of LLM usage, and so it helps to mean that you can get much more mileage out of your agents.

**13:59** · Um and we across a much larger basket of benchmarks, we have found that for the um more complex tasks, sort of multi-hop data retrieval, retrieval that requires a bit more post-processing because it's aggregating or or putting conditions on the data, um these tasks are uh sort of uh commonplace for coding agents.

**14:25** · And for these tasks, Claude code is much more efficient, 70% lower cost with Coral than it is using direct MCPs, and about 31% higher accuracy at this data retrieval. And so it can make all the difference in having an agent that's kind of grounded in factually accurate evidence from your data sources versus an agent that's not.

**14:55** · Um and this is relevant for a lot of different use cases. So we arrived at the the plan for building Coral because we were thinking a lot about um the DevOps and AI SRE use cases, which are ones that require very large-scale data sources, fragmented data sources, but what we realized is this approach is relevant for um almost every sort of LLM or agent use case that involves uh data sources.

**15:26** · It's especially helpful when those data sources um are heterogeneous. They they they they um you know, come from different types of data sources and they're large scale and there the uh the efficiency really starts to pay off. So, these are sort of a few examples and you can see on the Discord some examples of people um discussing ideas that they're going to work on. Some people have made a start already.

**15:55** · There's um folks working on um agents investigating security data. There's um you know, folks working on more sort of like customer technical support type um use cases. Um there was one uh recently that had created a source for meteorological data um which I thought was really cool.

**16:18** · And so, um there's some really interesting um ideas and and plans coming forth there. Um so, uh you know, uh use your creativity. Um I think it you know, it's obviously cool if it's novel. Um you have the flexibility to create source connectors for new data sources if they're not already there. Um but it doesn't have to be novel.

**16:40** · It could also be well, I I really want to do this particular product experience as well as I think it can be done and um and you know, uh for strong automation, strong kind of product experience, um you know, that would be interesting to see as well.

**16:58** · Um one of uh one of our motivations was because we're building a product for developers, for builders, um it's it's useful for us um indirectly to see the feedback and questions and experiences you all have building with Coral. Um, it's one of the ways we learn how uh we can um, improve it and build it um, and make it better.

**17:23** · And uh and then also um, because it's an open source project uh many of you will sort of directly be able to contribute back um, in some cases uh uh uh code to extend it, you know, whether that's in the form of of sources or or something like that.

**17:44** · Um, so uh we're we're super excited for uh you know, to see some of the things that are being built this week. Uh one last thing I'm going to explain before I hand over to James is um I wanted to share a bit about sort of what's next for Coral. Um, we you may be wondering uh how are these guys going to make money? It's an open source project. It's it's a free product. Um, where does this startup uh where does this startup sort of money making come in?

**18:11** · Well, uh we are going to have um essentially an open source core and we're going to have uh an enterprise license version of Coral uh which has some additional features in the future. And we will also have uh in the future a hosted like a SaaS version of Coral as well. And so the SaaS version uh will have a fee. The um the enterprise license will have a fee.

**18:38** · Um, a lot of larger organizations uh we expect will start with open source as they um feel that it's adding value and they're using it more and more, it will be um important for them to have uh support and um the sort of on-call and um access to those additional enterprise features that um that will be launching in the future. And so that's sort of the plan to make money from Coral.

**19:08** · Um, but what we believe in is that having a large pool of developers that are using the free and open source product is a very important part of our strategy. So, this isn't a sort of one-off project that we'll be walking back from.

**19:25** · It will forever be an important part of what we're doing with Coral. We want as as many developers as possible using it.

**19:36** · You can fork the project and include it in your own.

**19:43** · You can, you know, we've chosen a permissive license on purpose.

**19:48** · So, we want to be we want to be a very active part of the of the open source community.

**19:53** · Um So, that's it for me. And now, I think it'd be great for you to see an example of Coral in action. So, thank you and I'll hand over to James.

**20:04** · Thank you, Matt. Everyone, let me let's screen.

**20:10** · Um get this going.

**20:13** · \[laughter\] So, yeah, good to meet you. I know I've spoken to some of you in in Discord. So, this is what I who I am. Nice to meet you and see some of the PRs coming in.

**20:24** · Before we before we get started, can you ship me one of those Are you wearing a Coral shirt?

**20:29** · So, Matt's gone Matt's gone for the more formal look. I'm I'm I'm rapping. I'll talk to Cara. I need Coral OG, exactly. We should make that a prize.

**20:40** · Um \[snorts\] So, yeah, I thought it'd be useful to walk you through just getting started so everyone can get out out of the gates quickly, has a have a good kind of mental model of how Coral works, and um uh we can then take questions at the end for those who have some. So, here's our web page, you know that one.

**20:59** · I'm going to call out the docs. The docs are good, if I say so myself. We spent a lot of time trying to make these and human-friendly and agent-friendly. So, when you are stuck or have a question, I also recommend you point your agents at our docs. Um I'm going to walk through some of the installation steps um and show you live what this looks like, but I'm just going to help orient.

**21:23** · Um this is our GitHub repo. Again, we've got a pretty comprehensive readme um that explains the overall architecture um as well as how to how to get started. Um so let's get let's get started. Let's see see what this looks like. So, what do you do? We've got a few options. Number one, if you're on a Mac, um the best way to do it is brew install.

**21:49** · Um so, brew install with Correl/tap/Correl will install the latest release. We try to release at least weekly um probably more so during this week. You can also make uh build from source if you want. So, if you check out the repo and you make install, that will build uh the the latest tip um from source. We also have a um I forget. Let's pull it up. We also have a Correl command.

**22:17** · Um probably quicker just to grab it from the webpage. Uh on Linux, I'd recommend this one. Correl install and then as of Friday, thanks to some of our users already in the hackathon, we now have a Windows binary going out.

**22:33** · So, you can pull the latest binary off GitHub um on the release as well for those who use Windows. So, thanks very much to the community for putting together some good blog posts on that um that we used to get the the Windows binary going.

**22:48** · \[gasps\] So, what is Correl? One way to think of Correl is it sort of puts a SQL layer SQL runtime over over these downstream data sources. And a source is something that you define with uh with a YAML file. It's as simple as that.

**23:07** · So, we have two types of sources. We have core and we have community. Core ones the Coral team has built. Think of these as the sort of best practices and examples of how to build them. And then community is this rapidly growing set of sources coming in last week and this week. It's been great to see these these coming in. I pulled up one I thought was funny.

**23:30** · Matt, you haven't seen this. We have a Chuck Norris API source now in review for when you have your Chuck Norris query needs.

**23:41** · Um So, a source, if you don't have a source if there isn't a source available that you need, we've built Coral to be as friendly to agents building sources as possible. So, um if you can't find the the downstream source you need either in the community or in the core, we encourage you to build it yourself and unblock yourself.

**24:05** · Um and the best way to do that is to have an agent build it for you. You shouldn't be in there writing YAML. You should have your agent doing this work for you. Um and I'll walk you through how to do that. But, what is a source? A source is a YAML file that speaks like a YAML file that includes a few things.

**24:24** · Sort of what it is, a little description, how you authenticate. I'm just going to go over this at high level so we can look at the details later. Sort of how you authenticate.

**24:35** · Um And then things like what tables and what functions does it expose? So, for example, if we have a Let's pull up a function messages. So, we have a way to search messages in a Slack channel that can search for a given channel and for a timestamp range. And similarly, we can expose tables and stuff. So, this this manifest YAML is saying there is a thing called Slack, it has an API, here's how you query it, here's how you authenticate it with it, and here is how you then present it as a SQL table.

**25:06** · So, everything about Slack is in this one file that you can then import into Coral, and the Coral runtime will then be able to serve that up um to an agent, and it will look like a database. You can query it like you can a database. Um good. So, let me let me quickly go through. So, I went through installation. One thing I'm going to call out before I use Coral is um a skills agent skills.

**25:32** · So, sometimes these are easy to skip um in the docs, but I'm going to call these out explicitly. Um I think we have it down. Oh. We need to make this even more clear then. So, there are two uh yeah, here we go. Here we go. Here we go. Here we go.

**25:51** · Skills.

**25:52** · Install Coral skills.

**25:54** · So, um NPX skills add with Coral skills. What does that do? So, if you put that in, it will offer to install three skills um for whichever agent you use, whichever agent you prefer. Um there's the Coral skill, and this is the main skill file that teaches your agent how to use Coral. So, by installing this, you'll find you save a lot of time up front because the agent already knows how to use this.

**26:23** · It knows what Coral is, it knows what to use it for, it knows how to make queries effectively. So, you also sort of skip that first bit of it playing around and discovering what Coral is. So, install that one. If you want to create a source, what I mentioned earlier, we've written the skill for you. Um so, the Coral create source back. Install this one, and then ask your agent go create a source for Chuck Norris.

**26:52** · Um and in this scale, it will tell your agent exactly all of the steps it needs to go through to take your sort of target API source um and output that manifest. Um and it will also use Coral to validate and check and lint and make sure this uh this source actually works. So um so install that one if you need to create a source yourself.

**27:14** · And then the review source back is if you want to submit that source up for review. Um and we Coral team will review it. Um this will this will be the skill that we'll be using also to review the source, so you can save yourself time on the on the PR review by running some reviews and sort of fixing whatever this skill um or this skill finds on your PR.

**27:36** · So these three are your toolbox. I really recommend you install them in and use them. I think you'll have a better time um both using Coral and extending Coral with sources. So that's um that's skills. The other one is uh MCP. So there is a handy MPX command here. I'll copy.

**27:58** · Um we give you instructions per client if you're a Cloud Code or Code X user, for example, but there's another MPX command um similarly to skills, but MPX add MCP. So this is a shortcut to go and add Coral MCP server to whichever agent you use. So this will then make Coral available to say Cloud Code or Code X or Cursive. Um it will do all of the config for you. So two two handy shortcuts.

**28:26** · Um sometimes miss. I recommend you do that. That's a good shortcut. So let's look at sources. Um what are sources? I showed you those the YAML, so how do we get those into Coral? Well, we do Coral source and we can say what can we do there?

**28:41** · There's a few things. We can Coral source discover and that will show you the sources available that are the core bundle sources. Doesn't list community yet. We're working on that. So, whichever sources you contribute at some point soon, they will also show up in this list. Um we can also say Carl source list will show you what is installed. And you can see I've got some of these installed now. Some I've been playing with, working on.

**29:10** · Uh playing with one of the community ones. You've got a nice Hacker News search skill uh source now, which is nice. Um and then we can add a source. So, let me remove Let me do Carl source remove Slack for now. We'll start again. So, we'll say Carl source add Slack. And then if we do {dash} {dash} interactive, it means it will ask me questions here. So, it's easier to demo.

**29:33** · So, I can do Carl source add Slack. That's all we need to do. Hit go. And it will ask me, "How do you want to authenticate?" We've got two ways. We can either um connect with Slack using a user OAuth flow or we can have um essentially an API token from the Slack bot. This is new as of Friday, I think we launched this.

**29:54** · Um so, this makes the setup much much easier. And if you've got sources that require OAuth, these are now supported. So, go have a look at the Slack uh manifest for how this works. Um So, if we hit go, uh this is a Slack specific thing. We need to have set up the Slack app before we go. So, here's what I prepared earlier.

**30:16** · And it says, "Great." And it's picked the wrong browser. Well, I'm not logged in, of course, cuz it's demo. Let's try that again. And let's try this. Um Nope, still the wrong one. Third browser lucky. I think this is going to work now. This is too many browsers.

**30:41** · Um There we go. So, when you do this, it pops up your sort of familiar OAuth dialog, um assuming you you've got the right browser focused. But, all you have to say is say, "Do you want to add the app that you've created?" This one's called Nemo. And I'll say, "Yep, go ahead." It says, "Great, you're all done." And that's it. So, we add to do is the Coral source at Slack, click okay, and with that.

**31:08** · So, now Slack looks like uh database. So, let's have a look. So, we can say Coral SQL.

**31:18** · Select star from What can we do?

**31:21** · slack.channels.

**31:24** · And that will go out, it will go query Well, this doesn't really work on the screen, but it will go out and query Slack's API and bring it back, and you have to trust me, badly formatted on this. We can actually probably make it easier. We can do format JSON, pipe that to jq to make it look prettier. jq There you go.

**31:46** · So, out of the out of those queries comes um comes the results. So, nice. So, that was getting Slack set up, that was getting Slack installed, that was getting Slack authenticated with OAuth. Um once it's there, once it's installed, and I've just prepared a few queries to to help navigate.

**32:07** · Um what I'm going to do here is I'm showing you tables and functions by Coral. These are two tables, Coral table functions and Coral tables. These are two internal tables we show. And maybe if I make this a bit smaller, you can still see. So, here, if I look at Slack, by installing that source, it's exposed four things. It's exposed two tables, users, and channels. Oops, sorry. Users and channels and two functions, messages and thread replies.

**32:45** · So, a table SQL table, you know it a function is a a SQL table function in SQL. So, I'll show you what that could look like. Um If I take another one, curl SQL, this is saying Thank you.

**33:04** · Not that.

**33:06** · This is saying, "Show me the the timestamp, the user ID, etc. from Slack messages for this channel." So, rather than Slack messages where channel equals, we can do Slack messages as a function here. I can hit go.

**33:21** · And it will go out and go and fetch the messages I was looking for and come back and this is a channel I set up and shows me the messages. Great. Now, if I wanted to do a join, that's what DBs are good at. We don't need Oops. We don't need agents to do joins for us. We can do a simple select from left join on one table, messages, and join it on users.

**33:45** · And now, instead of a user ID, you get my username. So, don't make agents and do things that DBs can do for 40 years. Don't spend tokens on that. Coral can take care of that for you. Just express it as a SQL statement. We'll take care of the rest. So, that is cool.

**34:04** · The last thing I want to show Actually, one thing I will show is this next is the same question but asked to an agent. So, any messages in hackathon demo channel. This is quite a nice insight. This is Codex. You'll see this pattern where it will orient itself. So, it will call some things like searching a catalog and listing columns to see what's available. And then it will go out and issue some SQL statements.

**34:30** · And then it will get back the result. So, you'll see this pattern of the agent orienting, deciding what to do, and then acting by um issuing these statements and getting back what it needs.

**34:42** · We in Coral, like we are obsessed with making the agent as efficient as possible. So, where we see it taking wrong turns or taking too many steps to get to the answer, we are dead set on reducing those steps um in any way possible. We've got plenty more things coming down the line we can talk about after this about how to make this more efficient. So, when you ask the question, you should get the answer much faster with fewer fewer tool calls.

**35:11** · Um and then the last thing I want to leave with is that Coral out another thing that shipped on Friday just in time is a is the start of our UI. So, if I do Coral UI and hit enter, we have uh a nice way of seeing all of the queries that Coral is doing um under the hood. So, here I was saying um in the terminal, get me the Slack messages.

**35:37** · Um joined on users. Well, now we can see what did it actually do? Well, it went and made two API requests to Slack. If I click on one of those, I can see some more details about what it did. Um and it also did a query to users and did a join there.

**35:53** · And then I think there's some interesting ones if I say, select star from Slack channels. What looks like a simple statement actually went out and did five API requests, did all the pagination for you, took care of the authentication for you, and then joined up the results for you um behind the scenes. So, Coral is really trying hard to abstract all of that from you and especially your agent and saving sort of tokens in the process of doing that.

**36:20** · So, that is all I wanted to demo. This should get you started. It It give you a good idea of how to sort of just the internals of what's going on. Um we are all in Discord as uh as we said earlier, if you've got questions, ping me, ping the team. Very happy, excited to help um help answer. So, I will stop sharing my screen. Back to you, Can help. Back to you, Matt.

**36:45** · Cool.

**36:46** · Uh there are quite a little quite uh there are quite a lot of questions in the chat that the Coral team was answering. I believe they answered most of the questions, um but there's a there's an interesting one.

**36:58** · Um why are we making the AI write SQL?

**37:01** · Isn't modern vector search and rag much better for LLM agents than old school relational databases?

**37:07** · Good good question. Um the answer is not necessarily. Um so, vector search rag has their places, um but SQL SQL is a a very sort of effective way Excuse \[clears throat\] me, effective way of compressing an API. So, if you think tool calls like get, read, list, update, etc., you can actually much more succinctly um express those with joins and filters and select statements in SQL, so there's a lot less for the agent to understand.

**37:42** · That's number one. Number two, um LLMs have a lot of training data, pre-training data on SQL. You'll find most models are very good at writing SQL, much better than calling sort of a new tool that it hasn't really used before or been trained on.

**37:58** · Um Then number three, and importantly for sort of data retrieval, is by the writing SQL, what you're effectively doing is you're declaring kind of what information do you want, and you're not saying how to go about it. You're saying this is the information I want. And this is where Coral can get very smart, because we can behind the scenes optimize that query.

**38:19** · So, if we've already cached some of that information, \[snorts\] or we think there is a faster way of getting that information bypassing rate limits, for example, we can do all that optimization optimization behind the scenes for you, rather than having the agent write TypeScript or tool calls, and sort of not really have that information up front to do a plan to get that information. I'm going \[snorts\] to have a drink. Sorry, my throat's dried up. Matt, you can take over.

**38:45** · Talking too much.

**38:49** · Yeah, I was just going to add um I was just going to add to that that with um rag and vector search, uh one of the things that is often the case for operational data in a company is that it's very time window kind of um like it's either time series data directly, or the uh the period in which it happened is an important part of it. And so, um it uh lends itself to relational data well.

**39:20** · Um and then there are various techniques uh that we use that can help to support SQL queries across unstructured data sources, as well, which helps to make it more generalizable. Um now, uh in the future, we think that um sort of future versions of Coral uh uh will, you know, may not be SQL only as the interface.

**39:49** · It's just that uh it is um sort of so widely usable, has so much impact on efficiency that it was uh the most important uh type of tool interface that we wanted to start with.

**40:11** · Cool, there's another question. Um can I mix my uh if I want to build a personal agent, can I mix my own local CSV files with a web API like YouTube views? How do we tell the YAML config where to find our local folder path?

**40:29** · Yes, you can. This is a good use case. Let me share my screen again. Before my voice goes out. Um So, this is near and dear to my heart. This is a PR I was working on late last week that will go in soon. So, um as well as API backends, we have a backend type called file. This will be landing very soon. We did a small change um last week.

**40:53** · \[snorts\] Um So, check again this evening. This will be in. Uh where you can express similarly in a manifest a file path. This is my Codex history. There's also one for Claude history going in tonight.

**41:10** · Um And this you can also express things like columns um like you would do for other things. So, this has file types for JSON L files, CSV files, um parquet files. That's all supported out of the box. So, um take a look at this 456 easy-to-remember PR um for an example of how to do that.

**41:37** · All right.

**41:40** · Folks, I don't think we'll go through all the questions. Um but the silver lining is you can join the Discord server and that way you can share your uh file links and code snippets and stuff. Uh whereas on YouTube, you can only share a line or two. I'm just trying to go through um These were answered. That's one. That's one. Okay, let's take one more.

**42:07** · Do you handle non-relational systems? If yes, how do translate SQL?

**42:15** · Yeah, probably one good example if you go look at the notion source, you'll see we express say a search and point um as a table function. So in SQL, you could say select from search pages in notion and you'll see how \[snorts\] that get passed through to a sort of native provider search.

**42:38** · Amazing.

**42:39** · Thank you James, thank you Matt. Um cool, let me just see if there's any other interesting ones. Doesn't look like it. Uh cool. Um please send in your questions in the Discord server. Again, all the links can be found in the description.

**42:54** · Just go to remake that sort of RG and the coral page, you'll find all the links for all the resources. This live stream is recorded by the way as well, so you can watch it later on. You'll find the links to the Discord and everything, uh the GitHub, all the examples and literally everything.

**43:08** · Someone is asking if the event started today, can I still take part? Yeah, um you can take part any day of the week throughout the week till Sunday till the project submission closes. So whenever you are whenever you're interested, uh you can take part.

**43:22** · Um cool.

**43:24** · Um yeah, the exclusive, your question, send it in the Discord server. We'll answer and have fun there. Um James and Matt, thank you so much for your time and hoping to see some nice projects by some nice people and good luck people, happy hacking. Thanks, Gnan. Thanks, Gnan. Thanks, everybody.
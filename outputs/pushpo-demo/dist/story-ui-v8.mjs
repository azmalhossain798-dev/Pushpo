// One card presenter shared by the game and the story QA scene.
export function presentStoryCard(doc,g,beat){
 const el=id=>doc.getElementById(id),conversation=beat.kind==='conversation';
 el('story-heading').textContent=beat.title;el('story-text').textContent=beat.text;
 el('story-kicker').textContent=beat.kind==='verdict'?'JUSTICE REMEMBERED':'PUSHPO · INNER VOICE';
 el('story-screen').classList.toggle('conversation',conversation);el('story-portrait').classList.toggle('hidden',!conversation);
 el('story-speaker-pushpo').classList.toggle('hidden',beat.speaker!=='Pushpo');el('story-speaker-hercules').classList.toggle('hidden',beat.speaker!=='Hercules');
 if(conversation)el('story-kicker').textContent=`${beat.speaker.toUpperCase()} · ${g.story.index+1} / ${g.story.beats.length}`;
 if(beat.sequence==='farewell')el('story-kicker').textContent=`${beat.title} · শেষ কথা · ${g.story.index+1} / ${g.story.beats.length}`;
 el('story-screen').classList.toggle('reflection',beat.kind==='reflection');
 el('story-next').firstChild.textContent=beat.id==='sumon-note'?'Hear Pushpo’s thoughts ':beat.id==='sumon-reflection'?'Explore Mirpur · 150 new points ':beat.id==='hafizur-note'?'Look around the corner ':'Return to Mirpur ';
 if(conversation)el('story-next').firstChild.textContent=beat.sequence==='farewell'?(g.story.index===g.story.beats.length-1?'বিদায় ':'পরের কথা '):g.story.index===g.story.beats.length-1?'Let Hercules investigate ':'Continue ';
 el('story-screen').querySelector('.story-card').scrollTop=0;
 el('story-screen').classList.remove('story-arrival');void el('story-screen').offsetWidth;el('story-screen').classList.add('story-arrival');el('story-next').focus({preventScroll:true});
}

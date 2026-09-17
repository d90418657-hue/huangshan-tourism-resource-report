export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey) return res.status(503).json({error:'OPENAI_API_KEY is not configured'});
  try{
    const {question,context}=req.body||{};
    if(!question||typeof question!=='string') return res.status(400).json({error:'question is required'});
    const instructions='你是黄山旅游资源研判网站的研究助手。回答必须围绕黄山旅游资源，并以附件一摇摆周期模型为主要依据。综合值范围-10到10：(6,10]求异加强期，(1,6]求异和缓期，[-1,1]临界期，[-6,-1)求静和缓期，[-10,-6)求静加强期。十项观察源是游客接待量、住宿预订量、游客意向调研、网络热度、服务业收入、公共交通意向、配套服务设施、交通通行率、游客结构、文化噪音指数。正值偏向徽州文化、文创、研学与村落体验，负值偏向自然观光、生态保护、交通与承载。回答先给明确结论；数字先判断区间；尽量覆盖旅游设施、民宿酒店、游客体验、票价、公共交通、文化噪音、政府行动方案；必须说明为什么、投向哪里、如何执行、看什么指标；语言像给黄山市文旅管理者的实际研判；不要编造没有提供的实测值，没有数据就标注需要验证；使用小标题和条目，详细但不重复。';
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+apiKey},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5',instructions,input:'用户问题：'+question+'\n\n网站知识库补充：'+(context||'无额外补充'),max_output_tokens:1800})});
    const data=await response.json();
    if(!response.ok) return res.status(response.status).json({error:data?.error?.message||'OpenAI request failed'});
    return res.status(200).json({answer:data.output_text||'暂时没有生成内容，请稍后重试。'});
  }catch(error){return res.status(500).json({error:'AI service unavailable'});}
}

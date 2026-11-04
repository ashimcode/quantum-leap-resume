from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from xml.sax.saxutils import escape
import json,os
D=json.load(open('.qa/resume-data.json')); c=D['candidate']; styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='NameX',fontName='Helvetica-Bold',fontSize=27,leading=31,textColor=colors.HexColor('#172c29'),spaceAfter=9))
styles.add(ParagraphStyle(name='RoleX',fontName='Helvetica-Bold',fontSize=11,leading=16,spaceAfter=9,textColor=colors.HexColor('#28593d')))
styles.add(ParagraphStyle(name='BodyX',fontName='Helvetica',fontSize=9,leading=13,spaceAfter=6,textColor=colors.HexColor('#34463e')))
styles.add(ParagraphStyle(name='HeadX',fontName='Helvetica-Bold',fontSize=10,leading=15,spaceBefore=13,spaceAfter=7,textColor=colors.HexColor('#28593d')))
styles.add(ParagraphStyle(name='TitleX',fontName='Helvetica-Bold',fontSize=10,leading=14,spaceAfter=3,textColor=colors.HexColor('#172c29')))
styles.add(ParagraphStyle(name='SmallX',fontName='Helvetica',fontSize=8,leading=11,spaceAfter=6,textColor=colors.HexColor('#56645c')))
def p(s,style='BodyX'):return Paragraph(escape(s).replace('—','-').replace('–','-').replace('’',"'"),styles[style])
story=[p(c['name'],'NameX'),p(c['target'],'RoleX'),p('Albany, NY | linkedin.com/in/johnashim | github.com/ashimcode','SmallX'),p(c['summary']),p('EDUCATION & CREDENTIALS','HeadX'),p(c['education']),p(c['educationStatus']),p('Coursework: '+ '; '.join(c['coursework']),'SmallX'),p('Credentials & honors: '+ '; '.join(c['credentials']),'SmallX'),p('EXPERIENCE & LEADERSHIP','HeadX')]
for e in D['experience'][:6]:
 story.append(KeepTogether([p(e['title']+' | '+e['organization'],'TitleX'),p(e['dates'],'SmallX'),p(e['description'])]))
story.extend([PageBreak(),p(c['name']+' / Selected evidence','NameX'),p('SECURITY OPERATIONS PROJECT','HeadX')])
a=D['projects'][0]
story.extend([p(a['title'],'TitleX'),p(a['status'],'SmallX'),p(a['problem']),p(a['contribution']),p(a['outcome']),p(a['boundary'],'SmallX'),p(a['link'],'SmallX'),p('NETWORK INFRASTRUCTURE','HeadX'),p(D['projects'][2]['contribution']),p(D['projects'][2]['boundary'],'SmallX'),p('ADDITIONAL OPERATIONS EXPERIENCE','HeadX'),p(D['experience'][6]['organization']+' | '+D['experience'][6]['dates'],'TitleX'),p(D['experience'][6]['description']),p('EVIDENCE BOUNDARIES','HeadX'),p('Project descriptions distinguish documented work from proposed architecture. Research and Atlas completion claims await supporting evidence and are not included as completed achievements.'),p('PUBLIC CONTACT','HeadX'),p(c['links']['linkedin'])])
def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#d9ded6'));canvas.line(40,39,572,39);canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#56645c'));canvas.drawString(40,26,'Ashim John | Public resume');canvas.drawRightString(572,26,str(doc.page))
SimpleDocTemplate('public/resume-public.pdf',pagesize=(612,792),rightMargin=40,leftMargin=40,topMargin=35,bottomMargin=50,title='Ashim John - Public Resume',author='Ashim John').build(story,onFirstPage=footer,onLaterPages=footer)
import pypdf
r=pypdf.PdfReader('public/resume-public.pdf');assert len(r.pages)==2,f'Expected two pages, got {len(r.pages)}'
import pypdfium2 as pdfium
for i,page in enumerate(pdfium.PdfDocument('public/resume-public.pdf')):page.render(scale=1.4).to_pil().save(f'.qa/resume-{i+1}.png')

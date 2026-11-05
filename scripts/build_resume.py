"""Render the public resume exclusively from the canonical LinkedIn data export."""
from pathlib import Path
import sys, json
sys.path.insert(0, str(Path('.qa/python')))
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from xml.sax.saxutils import escape

D = json.loads(Path('.qa/resume-data.json').read_text(encoding='utf8'))
C = D['candidate']
styles = getSampleStyleSheet()
for name, size, leading, color, space in [('NameX',25,29,'#172c29',8),('RoleX',12,16,'#28593d',8),('HeadX',12,16,'#28593d',9),('TitleX',10,13,'#172c29',4),('BodyX',9,12,'#34463e',4),('SmallX',8,10,'#56645c',4)]:
    styles.add(ParagraphStyle(name=name, fontName='Helvetica-Bold' if name in ['NameX','RoleX','HeadX','TitleX'] else 'Helvetica', fontSize=size, leading=leading, textColor=colors.HexColor(color), spaceAfter=space))
def clean(text):
    return text.replace('—','-').replace('–','-').replace('’',"'").replace('·',' | ')
def p(text, style='BodyX'):
    return Paragraph(escape(clean(text)), styles[style])
def bullets(items):
    return [p('- '+item) for item in items]

story=[p(C['name']+' | '+C['pronouns'],'NameX'),p(C['headline'],'RoleX'),p(C['affiliation']+' | '+C['location'],'SmallX'),Paragraph('<link href="'+C['links']['linkedin']+'">linkedin.com/in/johnashim</link>',styles['SmallX']),p(C['summary']),Spacer(1,5),p('TOP SKILLS','HeadX'),p('; '.join(C['skills'])),Spacer(1,5),p('EDUCATION','HeadX')]
for e in D['education']:
    story.append(KeepTogether([p(e['degree'],'TitleX'),p(e['institution']+' | '+e['dates']+' | Grade: '+e['grade'],'SmallX'),p(e['details'])]+([p('Skills: '+', '.join(e['skills']),'SmallX')] if e['skills'] else [])))
story.extend([Spacer(1,5),p('LICENSES & CERTIFICATIONS','HeadX')])
for c in D['certifications']:
    story.append(KeepTogether([p(c['title'],'TitleX'),p(c['issuer']+' | Issued '+c['issued'],'SmallX')]+([p('Skills: '+', '.join(c['skills']),'SmallX')] if c['skills'] else [])))
story.extend([PageBreak(),p('EXPERIENCE','HeadX')])
for e in D['experience']:
    block=[p(e['title']+' | '+e['organization'],'TitleX'),p(e['employmentType']+' | '+e['dates']+' | '+e['location'],'SmallX')]+bullets(e['bullets'])
    if 'artifact' in e: block.append(p('Featured artifact: '+e['artifact'],'SmallX'))
    block.append(p('Skills: '+', '.join(e['skills']),'SmallX'))
    block.append(Spacer(1,5))
    story.append(KeepTogether(block))
story.extend([PageBreak(),p('PROJECTS','HeadX')])
for project in D['projects']:
    story.append(KeepTogether([p(project['title'],'TitleX'),p(project['dates']+' | Associated with '+project['association'],'SmallX'),p(project['contribution']),p('Skills: '+', '.join(project['tools']),'SmallX'),Spacer(1,10)]))
story.extend([p('SOURCE & PUBLIC CONTACT','HeadX'),p('Career, education, project, certification, and skill facts follow the candidate-supplied canonical LinkedIn specification. Entries are self-reported, not independently certified.'),p(C['links']['linkedin']),Paragraph('<link href="'+C['links']['github']+'">github.com/ashimcode</link>',styles['SmallX']),p('GitHub is a candidate-authorized public link, not a source for career claims.','SmallX')])
def footer(canvas,doc):
    canvas.setStrokeColor(colors.HexColor('#d9ded6')); canvas.line(40,38,572,38)
    canvas.setFont('Helvetica',8); canvas.setFillColor(colors.HexColor('#56645c'))
    canvas.drawString(40,25,'Ashim John | LinkedIn-aligned public resume'); canvas.drawRightString(572,25,str(doc.page))
SimpleDocTemplate('public/resume-public.pdf',pagesize=(612,792),leftMargin=40,rightMargin=40,topMargin=35,bottomMargin=50,title='Ashim John - LinkedIn Public Resume',author='Ashim John',subject='Candidate-supplied canonical LinkedIn specification',pageCompression=1).build(story,onFirstPage=footer,onLaterPages=footer)
from pypdf import PdfReader
reader=PdfReader('public/resume-public.pdf')
assert len(reader.pages)==3, f'Expected 3 complete pages, got {len(reader.pages)}'
import pypdfium2 as pdfium
out=Path('.qa/resume-render'); out.mkdir(parents=True,exist_ok=True)
for i,page in enumerate(pdfium.PdfDocument('public/resume-public.pdf')):
    page.render(scale=1.4).to_pil().save(out/f'resume-{i+1}.png')
print(f'Generated and rendered {len(reader.pages)} LinkedIn-only resume pages.')

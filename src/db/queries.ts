async function deleteAnalysis(repo: string): Promise<void> {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { repo },
    });
    if (!analysis) {
      throw new Error('Analysis record does not exist.');
    }
    await prisma.analysis.delete({
      where: { repo },
    });
  } catch (error) {
    console.error('deleteAnalysis failed:', error);
    throw error;
  }
}